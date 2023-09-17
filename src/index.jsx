import React from 'react';
import {useState, useRef, useEffect, useCallback} from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.scss';

import Vec from './utils/vec';
import hookify from './utils/hookify';
import useGlobalDOMEvents from './utils/useGlobalDOMEvents';

import Pattern from './pattern';

const PointView = ({x,y}) => {
	return (
		<circle cx={x} cy={y} r="40" stroke="black" strokeWidth="3" fill="red" />
	);
}

const usePattern = hookify(Pattern);

const SvgView = (props) => {
	const [view, setView] = useState({zoom: 2, center: new Vec(50, 50)});
	const [size, setSize] = useState(new Vec(1200, 800));

	const [dragging, setDragging] = useState(null);

	const pattern = usePattern(props.pattern);

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

			{
				pattern.getPoints().map(pt => (<PointView key={pt.id} x={pt.pos.x} y={pt.pos.y}/>))
			}
			
		</svg> 
	);
}

const pattern = new Pattern();

pattern.addPoint(new Vec())
pattern.addPoint(new Vec(100, 50))

const App = () => {
	return (
		<div className="container">
			<div className="header">
				<SvgView pattern={pattern}/>
			</div>
		</div>
	);
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
