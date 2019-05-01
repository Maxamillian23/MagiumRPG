/*:
 * @plugindesc This plugin let's you distribute to variables.
 * @author SumRndmDde
 *
 * @param Names
 * @desc The names of the variable parameters.
 * @default Strength, Power, Time
 *
 * @param Variable IDs
 * @desc The corresponding variable IDs for each of the names.
 * @default 1, 2, 3
 *
 * @help
 *
 * Variable Distribution
 * Version 1.00
 * SumRndmDde
 *
 *
 * This plugin let's you distribute to variables.
 *
 * ==============================================================================
 *  End of Help File
 * ==============================================================================
 * 
 * Welcome to the bottom of the Help file.
 *
 *
 * Thanks for reading!
 * If you have questions, or if you enjoyed this Plugin, please check
 * out my YouTube channel!
 *
 * https://www.youtube.com/c/SumRndmDde
 *
 *
 * Until next time,
 *   ~ SumRndmDde
 *
 */

var SRD = SRD || {};
SRD.VarDistribution = SRD.VarDistribution || {};

var Imported = Imported || {};
Imported["SumRndmDde Variable Distribution"] = 1.00;

(function(_) {

"use strict";

if(!Imported["SumRndmDde Stat Distribution"]) {
	return;
}

const params = PluginManager.parameters('SRD_VarDistribution');

_.stats = String(params['Names']).split(/\s*,\s*/);
_.varIds = String(params['Variable IDs']).split(/\s*,\s*/);

for(let i = 0; i < _.varIds.length; i++) {
	_.varIds[i] = parseInt(_.varIds[i]);
}

_.setup = function() {
	for(let i = 0; i < _.varIds.length; i++) {
		const id = _.varIds[i];
		if(!$dataDistributeStats["var" + id]) {
			$dataDistributeStats["var" + id] = {
				"name": "Variable " + id,
				"description":"Changes variable " + id,
				"cost":"1",
				"gain":"1",
				"max":"50",
				"min_col":"#aaaaaa",
				"max_col":"#ffffff"
			};
		}
	}
};

SRD.NotetagGetters.push(_.setup);

_.DataManagerEX_getStatDistributionHtmlOptions = DataManagerEX.getStatDistributionHtmlOptions;
DataManagerEX.getStatDistributionHtmlOptions = function() {
	let result = _.DataManagerEX_getStatDistributionHtmlOptions.apply(this, arguments);
	result += `<option value="frame">   </option>\n`;
	for(let i = 0; i < _.stats.length; i++) {
		result += `<option value="var${_.varIds[i]}">${_.stats[i]}</option>\n`;
	}
	return result;
};

_.Game_Actor_getAbnormalParam = Game_Actor.prototype.getAbnormalParam;
Game_Actor.prototype.getAbnormalParam = function(param) {
	if(param.startsWith('var')) {
		const id = parseInt(param.substring(3));
		return $gameVariables.value(id);
	}
	return _.Game_Actor_getAbnormalParam.apply(this, arguments);
};

_.Game_Actor_addAbnormalParam = Game_Actor.prototype.addAbnormalParam;
Game_Actor.prototype.addAbnormalParam = function(param, value) {
	if(param.startsWith('var')) {
		const id = parseInt(param.substring(3));
		$gameVariables.setValue(id, $gameVariables.value(id) + value);
		return;
	}
	_.Game_Actor_addAbnormalParam.apply(this, arguments);
};

_.Game_Actor_clearDistributeStats = Game_Actor.prototype.clearDistributeStats;
Game_Actor.prototype.clearDistributeStats = function() {
	_.Game_Actor_clearDistributeStats.apply(this, arguments);
	if(this.actor()) {
		const stats = this.actor()._sd_stats || SRD.StatDistribution.stats;
		for(let i = 0; i < stats.length; i++) {
			if(stats[i].startsWith('var')) {
				$gameVariables.setValue(parseInt(stats[i].substring(3)), 0);
			}
		}
	}
};

_.Window_Distribute_drawItem = Window_Distribute.prototype.drawItem;
Window_Distribute.prototype.drawItem = function(index) {
	const symbol = this.commandSymbol(index);
	if(symbol.startsWith('var')) {
		this.drawVariableItem(index, symbol);
	} else {
		_.Window_Distribute_drawItem.apply(this, arguments);
	}
};

Window_Distribute.prototype.drawVariableItem = function(index, symbol) {
	const rect = this.itemRectForText(index);
	const name = this.commandName(index);
	const nameWidth = this.textWidth(name);
	const statWidth = rect.width - nameWidth;
	let stat = $gameVariables.value(parseInt(symbol.substring(3)));
	this.changeTextColor(this.systemColor());
	const actor = this._actor;
	const data = $dataDistributeStats[symbol];
	const cost = eval(data.cost);
	let add = 0;
	if(this._bonuses[symbol] && this._bonuses[symbol] > 0) add = this._bonuses[symbol];
	const current = (actor.getDistribute(symbol) + add);
	const max = eval(data.max);
	this.changePaintOpacity((current < max && this.hasPoints(cost)) || (this._bonuses[symbol] && this._bonuses[symbol] > 0));
	if(SRD.StatDistribution.drawGauges) {
		let rate = 0;
		rate = current / max;
		this.drawGauge(rect.x, rect.y, rect.width, rate, data.min_col, data.max_col);
	}
	this.drawText(name, rect.x, rect.y, nameWidth, 'left');
	this.drawNormalItemNumbers(stat, symbol, nameWidth, statWidth, rect);
};

})(SRD.VarDistribution);