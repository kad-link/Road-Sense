import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { toPng } from 'html-to-image';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  calculateAdvancedDrivingScore, 
  generateTripAIAnalysis, 
  getLiveCoPilotAdvice 
} from '../utils/aiAdvisor';
import { 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Activity, 
  ArrowRight,
  Download,
  Flame,
  Radio
} from 'lucide-react';
import { BACKEND_URL, DETECTION_URL } from '../utils/apiConfig';

const DrowsinessDetector = () => {
  const { user, token } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [detectedClasses, setDetectedClasses] = useState([]);
  const [alert, setAlert] = useState(false);
  const [alertDuration, setAlertDuration] = useState(0);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [logs, setLogs] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const intervalRef = useRef(null);
  const resultCardRef = useRef(null);

  const [totalDrivingTime, setTotalDrivingTime] = useState(0);
  const [warningTime, setWarningTime] = useState(0);
  const [asleepTime, setAsleepTime] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [tripScore, setTripScore] = useState(null);
  const [tripStats, setTripStats] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const startTimeRef = useRef(null);
  const lastStateRef = useRef('normal');
  const stateStartTimeRef = useRef(null);
  const lastAlertStateRef = useRef(false);

  const fetchScoreHistory = async () => {
    if (!user?.email) return;
    setLoadingScores(true);
    try {
      const response = await fetch(`${BACKEND_URL}/score/${user.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setScoreHistory(data.scores || []);
      }
    } catch (error) {
      console.error('Failed to fetch score history:', error);
      // Fallback to local demo scores if offline or demo user
      try {
        const localScores = JSON.parse(localStorage.getItem('roadsense_demo_scores') || '[]');
        if (localScores.length > 0) setScoreHistory(localScores);
      } catch (e) {}
    } finally {
      setLoadingScores(false);
    }
  };

  const downloadScreenshot = async () => {
    if (!resultCardRef.current) return;

    try {
      const dataUrl = await toPng(resultCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#09090b'
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `roadsense-safety-report-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to capture report:', error);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      const now = Date.now();

      if (startTimeRef.current) {
        const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
        setTotalDrivingTime(elapsedSeconds);
      }

      if (stateStartTimeRef.current && lastStateRef.current) {
        if (lastStateRef.current === 'warning') {
          setWarningTime(prev => prev + 1);
        } else if (lastStateRef.current === 'asleep') {
          setAsleepTime(prev => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const updateDrivingState = (classes, isAlert) => {
    const now = Date.now();

    let newState = 'normal';
    if (isAlert || classes.includes('asleep') || classes.includes('sleeping')) {
      newState = 'asleep';
    } else if (classes.includes('drowsy') || classes.includes('yawning')) {
      newState = 'warning';
    }

    if (newState !== lastStateRef.current) {
      lastStateRef.current = newState;
      stateStartTimeRef.current = now;
    }
  };

  const simulateState = (stateName) => {
    const now = Date.now();
    let isAlarm = false;
    let classes = [];

    if (stateName === 'asleep') {
      isAlarm = true;
      classes = ['asleep', 'closed_eyes'];
      setAlert(true);
      setAlertDuration(prev => prev + 2);
      if (!lastAlertStateRef.current) {
        setAlertCount(prev => prev + 1);
      }
      lastAlertStateRef.current = true;
      playAlertSound();
    } else if (stateName === 'yawning') {
      classes = ['yawning', 'drowsy'];
      setAlert(false);
      lastAlertStateRef.current = false;
    } else {
      classes = [];
      setAlert(false);
      lastAlertStateRef.current = false;
    }

    setDetectedClasses(classes);
    updateDrivingState(classes, isAlarm);

    const logEntry = {
      id: now,
      timestamp: new Date().toLocaleTimeString(),
      classes: classes.length > 0 ? classes : ['normal'],
      alert: isAlarm,
      duration: isAlarm ? 2 : 0
    };
    setLogs(prevLogs => [logEntry, ...prevLogs].slice(0, 8));
  };

  useEffect(() => {
    const newSocket = io(DETECTION_URL, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    newSocket.on('detection_result', (data) => {
      setAnnotatedImage(data.image);
      setDetectedClasses(data.detected_classes || []);
      setAlert(data.alert);
      setAlertDuration(data.alert_duration || 0);

      if (data.alert && !lastAlertStateRef.current) {
        setAlertCount(prev => prev + 1);
      }
      lastAlertStateRef.current = Boolean(data.alert);

      updateDrivingState(data.detected_classes || [], data.alert);

      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        classes: data.detected_classes || [],
        alert: data.alert,
        duration: data.alert_duration || 0
      };

      setLogs(prevLogs => [logEntry, ...prevLogs].slice(0, 8));

      if (data.alert) {
        playAlertSound();
      }
    });

    return () => {
      newSocket.close();
      stopDetection();
    };
  }, []);

  const startDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);

        startTimeRef.current = Date.now();
        stateStartTimeRef.current = Date.now();
        lastStateRef.current = 'normal';
        lastAlertStateRef.current = false;
        setTotalDrivingTime(0);
        setWarningTime(0);
        setAsleepTime(0);
        setAlertCount(0);
        setAiAnalysis(null);
        setShowTripSummary(false);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          intervalRef.current = setInterval(() => {
            captureAndSendFrame();
          }, 100);
        };
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Unable to access webcam. Please verify camera permissions.');
    }
  };

  const stopDetection = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsActive(false);
    setDetectedClasses([]);
    setAlert(false);
    setAlertDuration(0);

    const activeDrivingTime = totalDrivingTime;
    const finalWarning = warningTime;
    const finalAsleep = asleepTime;
    const finalAlertCount = alertCount;

    startTimeRef.current = null;
    stateStartTimeRef.current = null;
    lastStateRef.current = 'normal';

    setTimeout(() => {
      setAnnotatedImage(null);
      setLogs([]);
    }, 0);

    if (activeDrivingTime > 0) {
      const analysis = generateTripAIAnalysis({
        totalTime: activeDrivingTime,
        warningTime: finalWarning,
        asleepTime: finalAsleep,
        alertCount: finalAlertCount,
        sessionDate: new Date()
      });

      setTripScore(analysis.score);
      setAiAnalysis(analysis);
      setTripStats({
        totalTime: activeDrivingTime,
        warningTime: finalWarning,
        asleepTime: finalAsleep,
        alertCount: finalAlertCount
      });

      if (user?.email && token) {
        fetch(`${BACKEND_URL}/score/${user.email}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            score: analysis.score,
          })
        }).then(res => res.json()).then(data => {
          if (data.success) fetchScoreHistory();
        }).catch(err => {
          console.error('Score save error:', err);
          // Persist locally for demo access
          try {
            const prev = JSON.parse(localStorage.getItem('roadsense_demo_scores') || '[]');
            const updated = [{ _id: 'demo-' + Date.now(), score: analysis.score, createdAt: new Date().toISOString() }, ...prev];
            localStorage.setItem('roadsense_demo_scores', JSON.stringify(updated.slice(0, 10)));
            setScoreHistory(updated);
          } catch (e) {}
        });
      }

      setShowTripSummary(true);
    }
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !socket || !socket.connected) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      socket.emit('frame', { image: imageData });
    } catch (error) {
      console.error('Error sending frame:', error);
    }
  };

  const playAlertSound = () => {
    try {
      const savedAudioPref = localStorage.getItem('roadsense_audio_alerts');
      if (savedAudioPref !== null && JSON.parse(savedAudioPref) === false) {
        return; // User has muted audio alerts in Settings
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 850;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio alert suppressed:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-rose-500';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!user || !user.email) return;
    if (!isActive) fetchScoreHistory();
  }, [isActive, user]);

  const liveAdvice = getLiveCoPilotAdvice({
    detectedClasses,
    alert,
    alertDuration,
    totalDrivingTime
  });

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 selection:bg-zinc-700 selection:text-white pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800/80">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Driver Safety Console
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Active vision fatigue monitoring & telematics tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border ${
              connectionStatus === 'connected'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{connectionStatus === 'connected' ? 'Vision Sensor (Python YOLOv8)' : 'Vision Sensor Ready (Edge AI)'}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatTime(totalDrivingTime)}</span>
            </div>
          </div>
        </div>

        {/* Live Safety Advisory Card */}
        {isActive && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
            alert
              ? 'bg-rose-950/30 border-rose-600/80'
              : detectedClasses.includes('drowsy')
              ? 'bg-amber-950/30 border-amber-600/60'
              : 'bg-zinc-900/90 border-zinc-800'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-lg border ${
                alert
                  ? 'bg-rose-950 text-rose-400 border-rose-700 animate-pulse'
                  : detectedClasses.includes('drowsy')
                  ? 'bg-amber-950 text-amber-400 border-amber-700'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}>
                {alert ? <AlertCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Driver Safety Advisory
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    alert
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-600'
                      : detectedClasses.includes('drowsy')
                      ? 'bg-amber-900/80 text-amber-200 border border-amber-600'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {liveAdvice.badge}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-100 mt-0.5">
                  {liveAdvice.text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800 w-full sm:w-auto justify-end">
              <div>
                <span className="text-zinc-500 block text-[10px]">INCIDENTS</span>
                <span className="font-bold text-rose-400 text-sm">{alertCount}</span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-zinc-500 block text-[10px]">MONITOR TIME</span>
                <span className="font-bold text-zinc-200 text-sm">{formatTime(totalDrivingTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Viewport & Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Visual Stream Viewport */}
          <div className="lg:col-span-8 bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden relative flex flex-col justify-between shadow-2xl">
            {/* Top Viewport Header */}
            <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Radio className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
                <span className="font-mono uppercase tracking-wider">
                  {isActive ? 'Live Telemetry Feed' : 'Optical Sensor Standby'}
                </span>
              </div>

              {isActive && (
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1.5 ${
                  alert
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : detectedClasses.includes('drowsy')
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {alert ? 'Critical Alert' : detectedClasses.includes('drowsy') ? 'Warning' : 'Normal'}
                </div>
              )}
            </div>

            {/* Video / Camera Canvas */}
            <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center bg-zinc-950 p-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={isActive && !annotatedImage ? "w-full h-auto max-h-[460px] object-contain rounded-xl" : "hidden"}
              />
              <canvas ref={canvasRef} className="hidden" />

              {isActive && annotatedImage ? (
                <img
                  src={annotatedImage}
                  alt="Live Vision Stream"
                  className="w-full h-auto max-h-[460px] object-contain rounded-xl"
                />
              ) : isActive ? null : (
                <div className="text-center p-8 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-medium text-white mb-1">
                    Camera Sensor Ready
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                    Connect your optical feed to begin monitoring driver eyelid metrics, yawning frequency, and fatigue alerts in real time.
                  </p>
                  <button
                    onClick={startDetection}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md cursor-pointer hover:shadow-zinc-700/20"
                  >
                    Engage Monitoring
                  </button>
                </div>
              )}

              {/* Alert Overlay Badge */}
              {alert && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-rose-600/95 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-20 flex items-center gap-3 border border-white/40">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <div>DROWSINESS DETECTED</div>
                    <div className="text-xs font-normal opacity-85">
                      Sustained closure: {alertDuration}s
                    </div>
                  </div>
                </div>
              )}

              {/* Corner Reticle Markers (Automotive HUD) */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-700 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-700 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-700 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-700 pointer-events-none" />
            </div>

            {/* Simulation toolbar if testing in Edge / Browser mode */}
            {isActive && (
              <div className="px-5 py-2.5 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {connectionStatus === 'connected' ? '📡 Streaming to YOLOv8 Engine' : '⚡ Live HUD Simulation Trigger:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => simulateState('normal')}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-emerald-300 font-mono transition-colors cursor-pointer"
                  >
                    🟢 Normal Focus
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateState('yawning')}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-amber-300 font-mono transition-colors cursor-pointer"
                  >
                    🟡 Yawn Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateState('asleep')}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-rose-300 font-mono transition-colors cursor-pointer"
                  >
                    🔴 Micro-Sleep Alarm
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="px-5 py-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
              <div className="text-xs text-zinc-400 font-mono">
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Recording telemetry
                  </span>
                ) : (
                  <span>Monitoring standby</span>
                )}
              </div>

              {isActive && (
                <button
                  onClick={stopDetection}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-sm bg-white" />
                  <span>End Session & View Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Telemetry & Scores Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Real-time stats card */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center justify-between">
                <span>Telemetry Telemetry</span>
                <Activity className="w-4 h-4 text-zinc-500" />
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Elapsed Time</span>
                  <span className="text-lg font-bold text-zinc-100">{formatTime(totalDrivingTime)}</span>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Warning Time</span>
                  <span className="text-lg font-bold text-amber-400">{formatTime(warningTime)}</span>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Asleep Time</span>
                  <span className="text-lg font-bold text-rose-400">{formatTime(asleepTime)}</span>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Alert Alarms</span>
                  <span className="text-lg font-bold text-rose-300">{alertCount}</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-xs">
                <div className="flex justify-between items-center text-zinc-400 mb-1">
                  <span>Detected States:</span>
                  <span className="font-semibold text-zinc-200">
                    {detectedClasses.length > 0 ? detectedClasses.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Score History / Live Events Sidebar */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {isActive ? 'Session Event Log' : 'Recent Trip Ratings'}
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {isActive ? `${logs.length} logged` : `${scoreHistory.length} total`}
                  </span>
                </div>

                {isActive ? (
                  logs.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            log.alert
                              ? 'bg-rose-950/30 border-rose-800 text-rose-200'
                              : log.classes.includes('drowsy')
                              ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                              : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-mono text-[10px] text-zinc-500 mr-2">{log.timestamp}</span>
                            <span className="font-medium">
                              {log.classes.length > 0 ? log.classes.join(', ') : 'Normal'}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ml-2 ${
                            log.alert ? 'bg-rose-600 text-white' :
                            log.classes.includes('drowsy') ? 'bg-amber-600 text-black' :
                            'bg-zinc-800 text-zinc-300'
                          }`}>
                            {log.alert ? 'ALARM' : log.classes.includes('drowsy') ? 'WARN' : 'OK'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                      Waiting for detection events...
                    </div>
                  )
                ) : (
                  loadingScores ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">Loading trips...</div>
                  ) : scoreHistory.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {scoreHistory.slice(0, 5).map((entry, idx) => (
                        <div
                          key={entry._id || idx}
                          className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 block">
                              {formatDate(entry.createdAt || entry.date)}
                            </span>
                            <span className={`text-base font-bold font-mono ${getScoreColor(Number(entry.score))}`}>
                              {Number(entry.score).toFixed(1)}%
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            Number(entry.score) >= 90 ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800' :
                            Number(entry.score) >= 75 ? 'bg-amber-950/50 text-amber-300 border-amber-800' :
                            'bg-rose-950/50 text-rose-300 border-rose-800'
                          }`}>
                            {Number(entry.score) >= 90 ? 'Optimal' : Number(entry.score) >= 75 ? 'Moderate' : 'Risk'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                      No historical trips recorded.
                    </div>
                  )
                )}
              </div>

              {!isActive && (
                <button
                  onClick={startDetection}
                  className="w-full mt-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Live Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Executive Trip Summary Report */}
        {showTripSummary && tripScore !== null && tripStats && aiAnalysis && (
          <section className="mt-8 pt-6 border-t border-zinc-800">
            <div
              ref={resultCardRef}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto"
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                    RoadSense Telematics Summary
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-0.5">
                    Trip Performance Report
                  </h2>
                  <p className="text-zinc-400 text-xs mt-1">
                    {aiAnalysis.statusHeadline}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                      SAFETY RATING
                    </span>
                    <span className="text-3xl font-black text-white font-mono">
                      {aiAnalysis.grade}
                    </span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${
                    aiAnalysis.riskLevel.includes('Low')
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : aiAnalysis.riskLevel.includes('Moderate')
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800'
                  }`}>
                    {aiAnalysis.riskLevel}
                  </div>
                </div>
              </div>

              {/* Primary Score & Focus Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono block">
                    ATTENTIVENESS INDEX
                  </span>
                  <div className={`text-5xl font-light font-mono my-2 ${getScoreColor(tripScore)}`}>
                    {tripScore.toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Normalized index based on continuous eye tracking & fatigue duration
                  </p>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">TOTAL TIME</span>
                    <span className="text-base font-bold text-zinc-100 mt-1 block">
                      {formatTime(tripStats.totalTime)}
                    </span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-emerald-400 block">FOCUS RATIO</span>
                    <span className="text-base font-bold text-emerald-300 mt-1 block">
                      {aiAnalysis.metrics.attentivePercentage}%
                    </span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-amber-400 block">WARNING TIME</span>
                    <span className="text-base font-bold text-amber-300 mt-1 block">
                      {formatTime(tripStats.warningTime)}
                    </span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-rose-400 block">ASLEEP TIME</span>
                    <span className="text-base font-bold text-rose-300 mt-1 block">
                      {formatTime(tripStats.asleepTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Circadian Risk Indicator */}
              <div className={`p-4 rounded-xl border mb-6 text-xs ${aiAnalysis.circadian.badgeClass}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <span>Circadian Analysis: {aiAnalysis.circadian.title}</span>
                </div>
                <p className="mt-1 leading-relaxed opacity-90 text-[11px]">
                  {aiAnalysis.circadian.description}
                </p>
              </div>

              {/* Structured Recommendations */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  Driver Safety Guidance
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiAnalysis.suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-zinc-400 font-mono">
                          {item.category}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'critical' ? 'bg-rose-400' :
                          item.type === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-100 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 text-center text-[10px] text-zinc-500 font-mono">
                RoadSense Safety System • Monitored at {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Export Action */}
            <div className="flex justify-center mt-6">
              <button
                onClick={downloadScreenshot}
                className="px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Telematics Report</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default DrowsinessDetector;