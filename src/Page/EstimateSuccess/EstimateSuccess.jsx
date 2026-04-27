import { Button, IconButton, Typography } from '@mui/material';
import './EstimateSuccess.scss';
import { Home, Printer, ScanQrCode, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import PritnModel from '../../components/JobScanPage/Scanner/PritnModel/PritnModel';
import LoadingBackdrop from '../../Utils/LoadingBackdrop';

const EstimateSuccess = () => {
    const printRef = useRef(null);
    const [printInfo, setPrintInfo] = useState();
    const [triggerPrint, setTriggerPrint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const printData = JSON.parse(sessionStorage.getItem("shareorprintData"));
    const navigate = useNavigate();
    const handleNavigate = (flag) => {
        if (flag === 'scan') {
            navigate('/JobScanPage', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }

    const handlePrintfind = () => {
        setPrintInfo(printData);
        setTriggerPrint(true);
    };

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
            image: { type: "jpeg", quality: 1.0 },    // ← max quality
            html2canvas: {
                scale: 4,                                 // ← higher scale = clearer text
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
            .catch(() => setIsLoading(false));
    };

    useEffect(() => {
        if (triggerPrint && printInfo) {
            setTimeout(() => {
                handlePrint();
                setTriggerPrint(false);
            }, 600);
        }
    }, [triggerPrint, printInfo]);

    return (
        <div className="estimateorder-success">
            <LoadingBackdrop isLoading={isLoading} />

            <div className="center-content">
                <div className="icon-ring">
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                        <circle cx="26" cy="26" r="24" stroke="#4CAF50" strokeWidth="2.5" opacity="0.25" />
                        <circle cx="26" cy="26" r="17" fill="#4CAF50" />
                        <path className="checkmark-tick" d="M16 27l7 7 13-14"
                            stroke="#fff" strokeWidth="3"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="status-chip">
                    <span className="dot" />
                    Estimate generated
                </div>

                <Typography className="es-title">
                    Your estimate is<br />ready to share!
                </Typography>
                <Typography className="es-sub">
                    All items have been recorded and your estimate is ready for download or sharing.
                </Typography>
            </div>

            <div className="button-group">
                <Button
                    variant="contained"
                    className="button1"
                    startIcon={<ScanQrCode width={18} height={18} />}
                    onClick={() => handleNavigate("scan")}
                >
                    Continue to Scan
                </Button>
                <Button
                    variant="outlined"
                    className="button2"
                    startIcon={<Home width={18} height={18} />}
                    onClick={() => handleNavigate("/")}
                >
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
                position: "fixed", top: "-9999px", left: "-9999px",
                width: "80mm", zIndex: -1, pointerEvents: "none"
            }}>
                <div ref={printRef}>
                    <PritnModel activeDetail={printInfo} />
                </div>
            </div>
        </div>
    );
};

export default EstimateSuccess;
