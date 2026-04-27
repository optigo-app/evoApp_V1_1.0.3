import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Button, Typography } from '@mui/material';
import './OrderSuccess.scss';
import { Home, ScanQrCode } from 'lucide-react';
import { replace, useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // useEffect(() => {
    //     setTimeout(() => {
    //         const myConfetti = confetti.create(canvasRef.current, { resize: true, useWorker: true });

    //         const duration = 100;
    //         const end = Date.now() + duration;

    //         (function frame() {
    //             myConfetti({
    //                 particleCount: 6,
    //                 angle: 60,
    //                 spread: 65,
    //                 origin: { x: 0, y: 0.6 },
    //                 colors: ['#22bb33', '#bb0000', '#0000ff'],
    //             });
    //             myConfetti({
    //                 particleCount: 6,
    //                 angle: 120,
    //                 spread: 65,
    //                 origin: { x: 1, y: 0.6 },
    //                 colors: ['#22bb33', '#ffdd00', '#00bbff'],
    //             });

    //             if (Date.now() < end) {
    //                 requestAnimationFrame(frame);
    //             }
    //         })();
    //     }, 300);
    //     return () => { clearInterval(canvasRef.current) }
    // }, []);

    const handleNavigate = (flag) => {
        if (flag === 'scan') {
            navigate('/JobScanPage', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }

    return (
        <div className="order-success">
            {/* <canvas ref={canvasRef} className="confetti-canvas" /> */}

            <div className="center-content">
                <div className="icon-circle">
                    <svg
                        className="checkmark"
                        viewBox="0 0 52 52"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path className="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
                    </svg>
                </div>

                <Typography variant="h5" fontWeight={600}>
                    Your Order has been accepted
                </Typography>
                <Typography variant="body2" color="textSecondary" className="subtext">
                    Your items have been placed and are on their way to being processed.
                </Typography>
            </div>

            <div className="button-group">
                <Button variant="contained" className='button1' startIcon={<ScanQrCode width={20} height={20} />} onClick={() => handleNavigate("scan")}>
                    Continue to Scan
                </Button>
                <Button variant="outlined" className='button2' startIcon={<Home width={20} height={20} />} onClick={() => handleNavigate("/")}>
                    Back to Home
                </Button>
            </div>
        </div>
    );
};

export default OrderSuccess;
