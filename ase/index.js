function onLoad() {
  var rootElement = document.getElementById("calculator")
  var model = {
    initialize: function () {
      this.apiCount = 12
      this.instancesPerApi = 2
      this.ramPerApi = 2048
      this.cpuPerApi = 0.57
      this.instanceSize = 3
      this.workersPerAse = 100
      this.aseMonthlyBaseCost = 1300
      this.instanceCostPerHour = 0.55
      this.hoursPerMonth = 730
    },
    update: function () {
      this.apiPerInstance = Math.min(
        Math.floor(this.instanceRam() / this.ramPerApi),
        Math.floor(this.instanceCpu() / this.cpuPerApi)
      )
      this.aseBaseCostPerMonthPerApiSet = 3 * this.aseMonthlyBaseCost
      this.workerPairs = Math.floor(this.workersPerAse / this.instancesPerApi)
      this.apiPerAse = this.workerPairs * this.apiPerInstance
      this.aseBaseCostPerMonth = (this.aseMonthlyBaseCost * (Math.floor(this.apiCount / this.apiPerAse) + 1)) * 3
      this.instanceCostPerMonth = Math.floor(this.instanceCostPerHour * this.hoursPerMonth * 100) / 100
      this.monthlyInstanceCostPerApiSet = Math.floor((this.instanceCostPerMonth * (Math.floor(this.apiCount / this.apiPerInstance) + 1) * 2 * 3) * 100) / 100
      this.totalCost = this.monthlyInstanceCostPerApiSet + this.aseBaseCostPerMonth
      this.apiCostPerMonth = Math.floor((this.totalCost / this.apiCount) * 100) / 100
    },
    instanceRam: function () {
      return [ 3.5, 7, 14 ][this.instanceSize - 1] * 1024
    },
    instanceCpu: function () {
      return [ 1, 2, 4 ][this.instanceSize - 1]
    }
  }

  new Tangle(rootElement, model)
}
