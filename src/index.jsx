import React from 'react';
import {useState, useRef, useEffect, useCallback} from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.scss';

import Vec from './utils/vec';

const PointView = ({x,y}) => {
	return (
		<circle cx={x} cy={y} r="40" stroke="black" strokeWidth="3" fill="red" />
	);
}

export default function useGlobalDOMEvents(props) {
	const eventsRef = useRef({});
	const events = eventsRef.current;

	useEffect(() => {
		for (let [key, func] of Object.entries(props))
		{
			events[key] = {
				currentCallback: func,
				domCallback: (e) =>
				{
					events[key].currentCallback(e);
				}
			};

			window.addEventListener(key, events[key].domCallback, false);
		}

		return () => {
			for (let [key, event] of Object.entries(events)) {
				window.removeEventListener(key, event.domCallback, false);
			}
		};
	}, []);

	for (let [key, evt] of Object.entries(events))
	{
		evt.currentCallback = props[key];
	}
}


const SvgView = () => {
	const [view, setView] = useState({zoom: 2, center: new Vec(50, 50)});
	const [size, setSize] = useState(new Vec(1200, 800));

	const [dragging, setDragging] = useState(null);
	//const dragging = draggingRef.current;

	const svgRef = useRef(null);

	const eventToPoint = (e) => {
		const pt = svgRef.current.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		return new Vec(pt.matrixTransform(svgRef.current.getScreenCTM().inverse()));
	}

	const handleScroll = (e) => {
		if(dragging)
		{
			return;
		}

		let {zoom, center} = view;

		const ratio = e.deltaY < 0 ? 1.1 : 0.9;
		const newZoom = zoom * ratio;

		const mousePos = eventToPoint(e);

		center = mousePos.sub(mousePos.sub(center).div(ratio));

		setView({
			zoom: newZoom,
			center: center
		});
	};

	const handleMouseUp = (e) => {
		if(!dragging)
		{
			return;
		}

		setDragging(null);
	};

	const handleMouseMove = (e) => {
		if(!dragging)
		{
			return;
		}

		const currentPoint = new Vec(e.clientX, e.clientY);
		const center = dragging.startViewPoint.add(dragging.startScreenPoint.sub(currentPoint).div(view.zoom));
		setView({
			...view,
			center
		});
	};

	const handleMouseDown = (e) => {
		event.preventDefault();
		event.stopPropagation();

		setDragging({
			startViewPoint: view.center.clone(),
			startScreenPoint: new Vec(e.clientX, e.clientY)
		});
	};

	useGlobalDOMEvents({
		mouseup: handleMouseUp,
		mousemove: handleMouseMove,
	});

	const viewBoxSize = size.div(view.zoom);
	const viewBoxStr = `${view.center.x - viewBoxSize.x / 2} ${view.center.y - viewBoxSize.y / 2} ${viewBoxSize.x} ${viewBoxSize.y}`;

	return (
		<svg ref={svgRef} 
			className="svg-view"
			onMouseDown={handleMouseDown} 
			onWheelCapture={handleScroll} 
			viewBox={viewBoxStr} 
			height={size.y} 
			width={size.x} >
			<PointView x={50} y={50}/>
		</svg> 
	);
}

const App = () => {
	return (
		<div className="container">
			<div className="header">
				<SvgView/>
			</div>
		</div>
	);
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
