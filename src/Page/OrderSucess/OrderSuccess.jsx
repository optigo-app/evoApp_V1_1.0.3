import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button, Typography } from '@mui/material';
import './OrderSuccess.scss';
import { Home, Printer, ScanQrCode, Share2 } from 'lucide-react';
import { replace, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import PritnModel from '../../components/JobScanPage/Scanner/PritnModel/PritnModel';

const OrderSuccess = () => {
    const canvasRef = useRef(null);
    const printRef = useRef(null);
    const [printInfo, setPrintInfo] = useState();
    const [triggerPrint, setTriggerPrint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const printData = JSON.parse(sessionStorage.getItem("shareorprintData"));
    console.log('printData: ', printData);
    const navigate = useNavigate();

    const handlePrintfind = () => {
        console.log('printData: ', printData);
        setPrintInfo(printData);
        setTriggerPrint(true);
    };



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

    const handleShare = () => {
        setPrintInfo(printData);
        const element = printRef.current;
        const elementHeight = element.scrollHeight;
        const elementWidth = element.scrollWidth;
        const widthMm = (elementWidth * 25.4) / 96;
        const heightMm = (elementHeight * 25.4) / 96;

        const opt = {
            margin: [2, 2, 2, 2],
            filename: "estimate.pdf",
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: {
                scale: 4,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                width: elementWidth,
                windowWidth: elementWidth,
                backgroundColor: "#ffffff",
                imageTimeout: 0,
            },
            jsPDF: {
                unit: "mm",
                format: [widthMm + 4, heightMm + 4],
                orientation: "portrait",
            },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .outputPdf("blob")
            .then((blob) => {
                const fileName = "estimate.pdf";
                if (window.flutter_inappwebview) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result.split(",")[1];
                        window.flutter_inappwebview.callHandler(
                            "sharePDF",
                            base64data,
                            fileName
                        );
                    };
                    reader.readAsDataURL(blob);
                } else {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }
            });
    };


    const handlePrint = () => {
        setIsLoading(true);
        const element = printRef.current;
        if (!element) {
            setIsLoading(false);
            return;
        }

        const allElements = element.querySelectorAll("*");
        allElements.forEach((el) => {
            el.style.color = "#000000";
            el.style.fontFamily = "Arial, Helvetica, sans-serif";
        });

        const elementHeight = element.scrollHeight;
        const elementWidth = element.scrollWidth;
        const widthMm = (elementWidth * 25.4) / 96;
        const heightMm = (elementHeight * 25.4) / 96;

        const opt = {
            margin: [2, 2, 2, 2],
            filename: "estimate.pdf",
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: {
                scale: 4,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                width: elementWidth,
                windowWidth: elementWidth,
                backgroundColor: "#ffffff",
                imageTimeout: 0,
            },
            jsPDF: {
                unit: "mm",
                format: [widthMm + 4, heightMm + 4],
                orientation: "portrait",
            },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .outputPdf("blob")
            .then((blob) => {
                const fileName = "estimate.pdf";
                if (window.flutter_inappwebview) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result.split(",")[1];
                        window.flutter_inappwebview.callHandler("downloadPDF", base64data, fileName);
                    };
                    reader.readAsDataURL(blob);
                } else {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("PDF generation failed:", err); // <-- was silently swallowed before
                setIsLoading(false);
            });
    };

    useEffect(() => {
        console.log('printInfo: ', printInfo);
        console.log('triggerPrint: ', triggerPrint);
        if (triggerPrint && printInfo) {
            setTimeout(() => {
                handlePrint();
                setTriggerPrint(false);
            }, 600); // ← increase from 300 to 600ms
        }
    }, [triggerPrint, printInfo]);

    // const handlePrintfind = (data, al

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

                <div className="icon-row">
                    <button className="icon-action-btn" onClick={handleShare}>
                        <Share2 size={16} />
                        Share PDF
                    </button>
                    <button className="icon-action-btn" onClick={handlePrintfind}>
                        <Printer size={16} />
                        Download
                    </button>
                </div>
            </div>

            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "80mm",
                height: 0,
                overflow: "hidden",   // keeps it invisible without moving it off-canvas
                zIndex: -1,
                pointerEvents: "none"
            }}>
                <div ref={printRef}>
                    <PritnModel activeDetail={printInfo} />
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
