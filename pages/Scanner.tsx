import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import jsQR from 'jsqr';
import { useData } from '../context/DataContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Zap, CameraOff } from 'lucide-react';

type ScanStatus = 'scanning' | 'processing' | 'success' | 'error' | 'no-camera';

const Scanner: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const navigate = ReactRouterDOM.useNavigate();
  const { giveDailyPoint } = useData();
  const { t, i18n } = useTranslation();

  const [status, setStatus] = React.useState<ScanStatus>('scanning');
  const [message, setMessage] = React.useState('');

  const handleQrCode = React.useCallback(async (data: string) => {
    setStatus('processing'); 

    // Improved validation
    if (!data || typeof data !== 'string' || !data.startsWith('user_')) {
        setMessage(t('scanner.error.invalidQR'));
        setStatus('error');
        setTimeout(() => setStatus('scanning'), 2500);
        return;
    }

    const result = await giveDailyPoint(data);

    if (result.success) {
        setMessage(t(result.messageKey, { name: result.receiverName }));
        setStatus('success');
        setTimeout(() => navigate('/constellation'), 2500);
    } else {
        setMessage(t(result.messageKey));
        setStatus('error');
        setTimeout(() => setStatus('scanning'), 2500);
    }
  }, [giveDailyPoint, t, navigate]);
  
  React.useEffect(() => {
    // If we're not in the scanning state, don't run the camera logic.
    if (status !== 'scanning') {
      return;
    }

    let stream: MediaStream | null = null;
    let animationFrameId: number | null = null;
    
    const tick = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (canvas && video.videoWidth > 0) {
                const context = canvas.getContext('2d', { willReadFrequently: true });
                if(context) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    try {
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            handleQrCode(code.data);
                            return; // Stop the loop once a code is found and is being processed
                        }
                    } catch (e) {
                        console.error("Error scanning QR code:", e);
                    }
                }
            }
        }
        animationFrameId = requestAnimationFrame(tick);
    };
    
    const startCamera = async () => {
      // Clear previous message
      setMessage('');
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setStatus('no-camera');
        setMessage(t('scanner.status.noCamera'));
      }
    };

    startCamera();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if(videoRef.current){
        videoRef.current.srcObject = null;
      }
    };
  }, [status, handleQrCode, t]);

  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;
  
  const renderFeedbackOverlay = () => {
    let icon = null;
    let text = message;
    let wrapperClass = "bg-black/70";

    switch(status) {
        case 'processing':
            icon = <Zap className="w-16 h-16 text-yellow-400 animate-pulse" />;
            text = t('scanner.status.processing');
            break;
        case 'success':
            icon = <CheckCircle className="w-16 h-16 text-green-400" />;
            wrapperClass = "bg-green-900/80";
            break;
        case 'error':
            icon = <XCircle className="w-16 h-16 text-red-400" />;
            wrapperClass = "bg-red-900/80";
            break;
        case 'no-camera':
            icon = <CameraOff className="w-16 h-16 text-red-400" />;
            text = t('scanner.status.noCamera');
            break;
        default:
            return null;
    }

    return (
        <div className={`absolute inset-0 ${wrapperClass} flex flex-col items-center justify-center p-4 text-center animate-fade-in-down`}>
            {icon && <div className="mb-4 flex justify-center">{icon}</div>}
            <p className="text-lg font-semibold text-white">{text}</p>
        </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black text-white">
      <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${status === 'scanning' ? 'opacity-100' : 'opacity-30'}`} muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Visual scanning guide */}
      <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
              <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none">
                  <div className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-12 h-12 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-12 h-12 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-12 h-12 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-12 h-12 rounded-br-lg"></div>
                  {status === 'scanning' && <div className="absolute top-0 left-0 w-full h-1 bg-white/80 rounded-full animate-scan"></div>}
              </div>
          </div>
      </div>
      
      {renderFeedbackOverlay()}

      <header className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
          <BackArrow size={24} />
        </button>
        {status === 'scanning' && (
            <div className="text-center bg-black/30 px-4 py-2 rounded-full">
                <p className="text-md font-semibold">{t('scanner.status.scanning')}</p>
            </div>
        )}
      </header>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(252px); }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
