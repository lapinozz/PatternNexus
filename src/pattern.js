
class Point
{
	id;
	pos;

	constructor(id, pos)
	{
		this.id = id;
		this.pos = pos;
	}
}

export default class Pattern 
{
	#points = [];
	#nextId = 1;

	constructor()
	{

	}

	#takeId()
	{
		return this.#nextId++;
	}

	getPoints()
	{
		return this.#points;
	}

	setPoints(points)
	{
		return this.#points;
	}

	static addPoint_mut = true;
	addPoint(pos)
	{	
		const id = this.#takeId(); 
		this.#points.push(new Point(id, pos));
	}
}