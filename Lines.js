function Lines(maxlines) {
	var lines = this.lines = [];
	this.maxlines = maxlines;
	this.incomplete = '';
}
Lines.prototype.pushLines = function (inputlines) {
	this.lines.push.apply(this.lines, inputlines);
	if (this.lines.length > this.maxlines) {
		this.lines = this.lines.slice(this.lines.length-this.maxlines, this.lines.length);
	}
};
Lines.prototype.addLine = function (line) {
	this.pushLines([line]);
};
Lines.prototype.addData = function (str) {
	var inputlines = str.split('\n');
	var res = '';
	if (inputlines.length > this.maxlines) {
		this.incomplete = inputlines.pop();
		this.lines = inputlines.slice(inputlines.length-this.maxlines, inputlines.length);
		res = this.getData();
	} else if (inputlines.length > 1) {
		inputlines[0] = this.incomplete+inputlines[0];
		this.incomplete = inputlines.pop();
		res = inputlines.join('\n')+'\n';
		this.pushLines(inputlines);
	} else if (inputlines.length > 0) {
		this.incomplete += inputlines[0];
	}
	return res;
};
Lines.prototype.getData = function () {
	return this.lines.length ? this.lines.join('\n')+'\n' : '';
};
Lines.prototype.freshLine = function () {
	if (this.incomplete) {
		this.pushLines([this.incomplete]);
		this.incomplete = '';
	}
};
exports.Lines = Lines;
