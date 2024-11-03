import React, { useEffect, useRef, useState } from 'react';
import { ColorSwatch, Group } from '@mantine/core';
import { SWATCHES } from '../../constants';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Draggable from 'react-draggable';
import { FaRedo, FaUndo, FaSyncAlt, FaCalculator, FaSpinner } from 'react-icons/fa';

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

interface GeneratedResult {
    expression: string;
    answer: string;
}

const Home = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [customColor, setCustomColor] = useState<string | undefined>();
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult>();
    const [dictOfVars, setDictOfVars] = useState({});
    const [latexExpression, setLatexExpression] = useState<string[]>([]);
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [history, setHistory] = useState<ImageData[]>([]); // History for undo/redo
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
            setHistory([]); // Clear history on reset
            setHistoryIndex(-1);
        }
    }, [reset]);

    // Initialize canvas with default background color
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height); // Set initial background color to black
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
                saveHistory(); // Save the initial canvas state
            }
        }

        // Load MathJax
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
            });
        };

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black'; // Reset to default background color
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const sendData = async () => {
        const canvas = canvasRef.current;
        
        if (canvas) {
            setIsLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/calculate`, {
                image: canvas.toDataURL('image/png'),
                dict_of_vars: dictOfVars,
            });
            const resp = response.data;

            resp.data.forEach((data: Response) => {
                if (data.assign) {
                    setDictOfVars((prev) => ({ ...prev, [data.expr]: data.result }));
                }
            });
            setIsLoading(false);

            // Calculate center for latex positioning
            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData.data[i + 3] > 0) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });

            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({ expression: data.expr, answer: data.result });
                }, 1000);
            });
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveHistory(); // Save the drawing state to history after each drawing session
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = customColor || color; // Use selected color
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };

    // Save the current state of the canvas to history
    const saveHistory = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setHistory((prev) => [...prev.slice(0, historyIndex + 1), imageData]);
                setHistoryIndex((prev) => prev + 1);
            }
        }
    };

    // Clear the canvas and render the LaTeX expression
    const renderLatexToCanvas = (expression: string, answer: string) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear the canvas to remove previous drawings and results
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Update the history after clearing
                saveHistory();
            }
        }

        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);
    };

    // Undo function
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.putImageData(history[newIndex], 0, 0);
                }
            }
        }
    };

    // Redo function
    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.putImageData(history[newIndex], 0, 0);
                }
            }
        }
    };

    return (
        <>
            <div className='grid grid-cols-5 gap-2'>
                <Button
                    onClick={() => setReset(true)}
                    className="z-20 bg-black text-white hover:bg-gray-700 active:bg-gray-900 transition-all duration-150"
                    title="Reset"
                >
                    <FaSyncAlt />
                </Button>
                <Button
                    onClick={undo}
                    className="z-20 bg-black text-white hover:bg-gray-700 active:bg-gray-900 transition-all duration-150"
                    title="Undo"
                >
                    <FaUndo />
                </Button>
                <Button
                    onClick={redo}
                    className="z-20 bg-black text-white hover:bg-gray-700 active:bg-gray-900 transition-all duration-150"
                    title="Redo"
                >
                    <FaRedo />
                </Button>

                <Group className='z-20'>
                {SWATCHES.map((swatchColor: string) => (
                    <ColorSwatch
                        key={swatchColor}
                        color={swatchColor}
                        onClick={() => setColor(swatchColor)}
                        className="hover:scale-105 transition-transform duration-150"
                    />
                ))}
                    <input type="color" onChange={(e) => setCustomColor(e.target.value)} value={customColor || color} />
                </Group>
                <Button
                    onClick={sendData}
                    className="z-20 bg-black text-white hover:bg-gray-700 active:bg-gray-900 transition-all duration-150"
                    disabled={isLoading}
                    title="Calculate"
                >
                    {isLoading ? <FaSpinner className="animate-spin" /> : <FaCalculator />}
                </Button>
            </div>
            <canvas
                ref={canvasRef}
                className='absolute top-0 left-0 w-full h-full'
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
            />
            {latexExpression && latexExpression.map((latex, index) => (
                <Draggable key={index} defaultPosition={latexPosition} onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}>
                   <div
                        className="absolute p-2 text-white rounded shadow-md animate-fadeIn"
                        style={{ animationDuration: '0.3s' }}
                    >
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
        </>
    );
};

export default Home;
