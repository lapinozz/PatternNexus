import React from 'react';
import {useState, useRef} from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.scss';

import Vec from './utils/vec';

const PointView = ({x,y}) => {
	return (
		<circle cx={x} cy={y} r="40" stroke="black" strokeWidth="3" fill="red" />
	);
}

const SvgView = () => {
	const [view, setView] = useState({zoom: 2, center: new Vec(50, 50)});
	const [size, setSize] = useState(new Vec(1200, 800));

	const svgRef = useRef(null);

	const onScroll = (e) => {
		let {zoom, center} = view;

		const ratio = e.deltaY < 0 ? 1.1 : 0.9;
		const newZoom = zoom * ratio;

		var pt = svgRef.current.createSVGPoint();
		function cursorPoint(evt){
		  pt.x = evt.clientX;
		  pt.y = evt.clientY;
		  return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
		}

		const mousePos = new Vec(cursorPoint(e));

		center = mousePos.sub(mousePos.sub(center).div(ratio));

		setView({
			zoom: newZoom,
			center: center
		});
	};

	const viewBoxSize = size.div(view.zoom);
	const viewBoxStr = `${view.center.x - viewBoxSize.x / 2} ${view.center.y - viewBoxSize.y / 2} ${viewBoxSize.x} ${viewBoxSize.y}`;

	return (
		<svg ref={svgRef} className="svg-view" onWheelCapture={onScroll} viewBox={viewBoxStr} height={size.y} width={size.x} >
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
