/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Fix: Import React, hooks, ReactDOM, Chart.js, and annotation plugin.
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { GoogleGenAI } from "@google/genai";

// Fix: Register Chart.js components and plugins.
Chart.register(...registerables, annotationPlugin);

const App = () => {
    // Fix: 'React' refers to a UMD global... - Hooks are now imported directly, so this line is removed.

    const [logs, setLogs] = useState([]);
    const [temperature, setTemperature] = useState('');
    const [feeling, setFeeling] = useState('');
    const [medicines, setMedicines] = useState('');
    const [notes, setNotes] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoadingOcr, setIsLoadingOcr] = useState(false);
    
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    
    const API_KEY = process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const feverZones = [
        { yMin: 0, yMax: 99.1, label: 'Normal', color: 'rgba(75, 192, 192, 0.1)' },
        { yMin: 99.1, yMax: 100.4, label: 'Low-grade', color: 'rgba(255, 206, 86, 0.1)' },
        { yMin: 100.4, yMax: 102.2, label: 'Moderate', color: 'rgba(255, 159, 64, 0.1)' },
        { yMin: 102.2, yMax: 105.8, label: 'High-grade', color: 'rgba(255, 99, 132, 0.1)' }
    ];

    useEffect(() => {
        if (chartRef.current) {
            const context = chartRef.current.getContext('2d');
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            // Fix: Cannot find name 'Chart'. 'Chart' is now available due to import.
            chartInstanceRef.current = new Chart(context, {
                type: 'line',
                data: {
                    labels: logs.map(log => new Date(log.time).toLocaleString()),
                    datasets: [{
                        label: 'Temperature (°F)',
                        data: logs.map(log => log.temperature),
                        borderColor: '#3B82F6',
                        backgroundColor: '#BFDBFE',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 95,
                            max: 106,
                            title: { display: true, text: 'Temperature (°F)' }
                        },
                        x: {
                             title: { display: true, text: 'Time' }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        annotation: {
                            annotations: feverZones.map(zone => ({
                                type: 'box',
                                yMin: zone.yMin,
                                yMax: zone.yMax,
                                backgroundColor: zone.color,
                                borderWidth: 0,
                                label: {
                                    content: zone.label,
                                    display: true,
                                    position: 'start',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    color: zone.color.replace('0.1', '1').replace('rgba', 'rgb'),
                                    font: { weight: 'bold' }
                                }
                            }))
                        }
                    }
                }
            });
        }
    }, [logs]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!temperature || isNaN(parseFloat(temperature))) {
            alert('Please enter a valid temperature.');
            return;
        }
        const newLog = {
            time: new Date().toISOString(),
            temperature: parseFloat(temperature),
            feeling,
            medicines,
            notes
        };
        // Fix: Use .getTime() for date subtraction to satisfy TypeScript type checking for arithmetic operations.
        setLogs([...logs, newLog].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
        setTemperature('');
        setFeeling('');
        setMedicines('');
        setNotes('');
    };

    const handleOpenCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access camera. Please ensure permissions are granted.");
            setIsCameraOpen(false);
        }
    };

    const handleCloseCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
        setIsLoadingOcr(false);
    };

    const handleCaptureAndOcr = async () => {
        if (!videoRef.current) return;
        setIsLoadingOcr(true);

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        
        try {
            const imagePart = {
                inlineData: { mimeType: 'image/jpeg', data: base64Image },
            };
            const textPart = {
                text: "Extract the numerical temperature reading from this image of a digital thermometer. Return only the number, for example: 98.6"
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            
            const tempText = response.text.trim();
            const extractedTemp = parseFloat(tempText);

            if (!isNaN(extractedTemp)) {
                setTemperature(extractedTemp.toString());
            } else {
                alert(`Could not read a valid temperature. Gemini returned: "${tempText}"`);
            }
        } catch (error) {
            console.error("Error during OCR:", error);
            alert("An error occurred while trying to read the temperature.");
        } finally {
            handleCloseCamera();
        }
    };


    return (
        <main className="container">
            <h1>Fever Tracker</h1>
            
            <div className="content-wrapper">
                <div className="form-and-table">
                    <section className="card form-section" aria-labelledby="form-heading">
                        <h2 id="form-heading">Log New Entry</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="temperature">Temperature (°F)</label>
                                <div className="temp-input-wrapper">
                                    <input
                                        id="temperature"
                                        type="number"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(e.target.value)}
                                        placeholder="e.g., 98.6"
                                        required
                                        aria-required="true"
                                    />
                                    <button type="button" className="icon-button" onClick={handleOpenCamera} aria-label="Extract temperature from thermometer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M4 4h3l2-2h6l2 2h3v16H4V4zm8 11.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 6.5 12 6.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/><path d="M12 8.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="feeling">How are you feeling?</label>
                                <input
                                    id="feeling"
                                    type="text"
                                    value={feeling}
                                    onChange={(e) => setFeeling(e.target.value)}
                                    placeholder="e.g., Tired, headache"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="medicines">Medicines Taken</label>
                                <input
                                    id="medicines"
                                    type="text"
                                    value={medicines}
                                    onChange={(e) => setMedicines(e.target.value)}
                                    placeholder="e.g., Ibuprofen 200mg"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    // Fix: Type 'string' is not assignable to type 'number'. Changed to a number.
                                    rows={3}
                                    placeholder="e.g., Drank lots of water."
                                ></textarea>
                            </div>
                            <button type="submit" className="button-primary">Save Entry</button>
                        </form>
                    </section>
                    
                    <section className="card log-section" aria-labelledby="log-heading">
                        <h2 id="log-heading">History</h2>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Temp (°F)</th>
                                        <th>Feeling</th>
                                        <th>Medicines</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length > 0 ? (
                                        logs.map(log => (
                                            <tr key={log.time}>
                                                <td>{new Date(log.time).toLocaleString()}</td>
                                                <td>{log.temperature.toFixed(1)}</td>
                                                <td>{log.feeling}</td>
                                                <td>{log.medicines}</td>
                                                <td>{log.notes}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            {/* Fix: Type 'string' is not assignable to type 'number'. Changed to a number. */}
                                            <td colSpan={5}>No entries yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
                
                <section className="card chart-section" aria-labelledby="chart-heading">
                    <h2 id="chart-heading">Temperature Trend</h2>
                    <div className="chart-wrapper">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </section>
            </div>
            
            {isCameraOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Point Camera at Thermometer</h3>
                        <div className="video-container">
                             <video ref={videoRef} autoPlay playsInline muted></video>
                             {isLoadingOcr && <div className="loading-spinner"></div>}
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleCaptureAndOcr} disabled={isLoadingOcr} className="button-primary">
                                {isLoadingOcr ? 'Reading...' : 'Capture & Read'}
                            </button>
                            <button onClick={handleCloseCamera} disabled={isLoadingOcr} className="button-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

// Fix: 'ReactDOM' refers to a UMD global... and use createRoot for React 18 rendering.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
