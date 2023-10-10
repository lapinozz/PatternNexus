import React from 'react';
import {useState, useRef, useEffect, useCallback} from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.scss';

import Vec from './utils/vec';
import hookify from './utils/hookify';
import useDragger from './utils/dragger';

import Pattern from './pattern';

const PointView = ({x,y}) => {
	return (
		<circle cx={x} cy={y} r="2" stroke="black" strokeWidth="0.5" fill="gray" />
	);
}

const usePattern = hookify(Pattern);

const PatternEditor = (props) => {
	const [view, setView] = useState({zoom: 2, center: new Vec(50, 50)});
	const [size, setSize] = useState(new Vec(1200, 800));

	const pattern = usePattern(props.pattern);

	const svgRef = useRef(null);

	const screenPosToSvgPos = (pos) => {
		const pt = svgRef.current.createSVGPoint();
		pt.x = pos.x;
		pt.y = pos.y;
		return new Vec(pt.matrixTransform(svgRef.current.getScreenCTM().inverse()));
	}

	const eventToSvgPos = (e) => {
		return screenPosToSvgPos({x: e.clientX, y: e.clientY});
	}

	const handleScroll = (e) => {
		let {zoom, center} = view;

		const ratio = e.deltaY < 0 ? 1.1 : 0.9;
		const newZoom = zoom * ratio;

		const mousePos = eventToSvgPos(e);

		center = mousePos.sub(mousePos.sub(center).div(ratio));

		setView({
			zoom: newZoom,
			center: center
		});
	};

	const onDragEnd = (e) => {
	};

	const onDrag = (e, {delta}) => {
		const center = view.center.sub(delta.div(view.zoom));
		setView({
			...view,
			center
		});
	};

	const onDragStart = (e) => {
	};

	const onClick = (e, {currentPos}) => {
		pattern.addPoint(screenPosToSvgPos(currentPos));
	};

	const onDbClick = (e, {currentPos}) => {
		pattern.addPoint(screenPosToSvgPos(currentPos).add(50));
	};

	const {dragger, handleMouseDown} = useDragger({onDragStart, onDrag, onDragEnd, onClick, onDbClick});

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
			<PatternEditor pattern={pattern}/>
		</div>
	);
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
