function onLoad() {
  var rootElement = document.getElementById("calculator")
  var model = {
    initialize: function () {
      this.saving = 3600
      this.salary = 100000
      this.hours = 16
    },
    update: function () {
      var costPerDay = this.salary / 261
      var costPerHour = costPerDay / 8
      var costForSaving = this.hours * costPerHour
      this.costForSaving = (Math.ceil(costForSaving/100))*100

      this.timeToRecover = (Math.ceil(((costForSaving / this.saving) * 365.25)/100))*100
    },
  }
  new Tangle(rootElement, model)
}
