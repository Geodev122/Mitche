import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { useData } from '../context/DataContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Zap } from 'lucide-react';

type ScanStatus = 'scanning' | 'processing' | 'success' | 'error' | 'no-camera';

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Initialize useRef with null to prevent "Expected 1 arguments, but got 0" error and ensure type safety.
  const animationFrameId = useRef<number | null>(null);
  const navigate = useNavigate();
  const { giveDailyPoint } = useData();
  const { t, i18n } = useTranslation();

  const [status, setStatus] = useState<ScanStatus>('scanning');
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  
  const handleResult = (newStatus: 'success' | 'error', newMessage: string) => {
    setStatus(newStatus);
    setMessage(newMessage);
    setTimeout(() => {
      if (newStatus === 'success') {
        navigate('/constellation');
      } else {
        setMessage('');
        setStatus('scanning');
        setIsPaused(false);
      }
    }, 3000);
  };

  const handleQrCode = useCallback(async (data: string) => {
    if (isPaused) return;

    if(!data || !data.startsWith('user_')) {
      handleResult('error', t('scanner.error.invalidQR'));
      return;
    }
    setIsPaused(true);
    setStatus('processing');
    const result = await giveDailyPoint(data);
    if (result.success) {
      handleResult('success', t(result.messageKey, { name: result.receiverName }));
    } else {
      handleResult('error', t(result.messageKey));
    }
  }, [isPaused, giveDailyPoint, t, navigate]);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    const tick = () => {
        if (isPaused) return;

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
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });
                    if (code) {
                        handleQrCode(code.data);
                    }
                }
            }
        }
        if (!isPaused) {
           animationFrameId.current = requestAnimationFrame(tick);
        }
    };
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animationFrameId.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setStatus('no-camera');
        setMessage(t('scanner.status.noCamera'));
      }
    };

    if (!isPaused) {
      startCamera();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isPaused, handleQrCode, t]);

  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;
  
  const statusInfo = {
    scanning: { text: t('scanner.status.scanning'), icon: null, color: 'text-white' },
    processing: { text: t('scanner.status.processing'), icon: <Zap className="w-16 h-16 text-yellow-400 animate-pulse" />, color: 'text-yellow-400' },
    success: { text: message, icon: <CheckCircle className="w-16 h-16 text-green-400" />, color: 'text-green-400' },
    error: { text: message, icon: <XCircle className="w-16 h-16 text-red-400" />, color: 'text-red-400' },
    'no-camera': { text: message, icon: <XCircle className="w-16 h-16 text-red-400" />, color: 'text-red-400' },
  };
  
  const currentStatusInfo = statusInfo[status];
  
  return (
    <div className="fixed inset-0 bg-black text-white">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4">
        {/* Scanner overlay */}
        <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 border-t-4 border-l-4 border-white w-12 h-12 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 border-t-4 border-r-4 border-white w-12 h-12 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-white w-12 h-12 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-white w-12 h-12 rounded-br-lg"></div>
            {status === 'scanning' && <div className="absolute top-0 left-0 w-full h-1 bg-white/80 rounded-full animate-scan"></div>}
        </div>
        
        <div className={`mt-8 text-center p-4 rounded-lg transition-opacity ${currentStatusInfo.color}`}>
            {currentStatusInfo.icon && <div className="mb-4 flex justify-center">{currentStatusInfo.icon}</div>}
            <p className="text-lg font-semibold">{currentStatusInfo.text || ' '}</p>
        </div>

      </div>

      <header className="absolute top-0 left-0 right-0 p-4 z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/30 rounded-full">
          <BackArrow size={24} />
        </button>
      </header>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(252px); }
        }
        .animate-scan {
          animation: scan 2s linear infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
