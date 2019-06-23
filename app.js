var budgetController = (function(){
    var Expence = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
    };
    var Income = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
    };

    var calcualteTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value
        })
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    return{
        addItem: function(type, des, value){
            var newItem ;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            if(type === 'exp'){
                newItem = new Expence(ID, des, value);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, value);
            };
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function(){
            calcualteTotal('inc');
            calcualteTotal('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpences: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function(type, id){
            var ids = data.allItems[type].map(function(current){
                return current.id
            })
            var index = ids.indexOf(id)

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function(){
            console.log(data)
        }
    }
})();


var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenceLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        dateLabel: '.budget__title--month'
    };
    return{
        getInput: function(){
            return{
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        getDOMstrings: function(){
            return DOMstrings;
        },
        addListItem: function(obj,type){
          var html, newHtml, element;
          if(type === 'inc'){
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          }else if(type === 'exp'){
            element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          }
          newHtml = html.replace('%id%', obj.id);
          newHtml = newHtml.replace('%description%', obj.description);
          newHtml = newHtml.replace('%value%', this.formatNumber(obj.value, type));

          document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function(){
           var fields =  document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                element.value = ''
            });
            fieldsArr[0].focus();
        },
        deleteListItem: function(selectorId){
            document.getElementById(selectorId).parentNode.removeChild(document.getElementById(selectorId))
        },
        displayBudget: function(obj){ 
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalIncome, 'inc')
            document.querySelector(DOMstrings.expenceLabel).textContent = this.formatNumber(obj.totalExpences, 'exp')

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },
        formatNumber: function(num, type){
            num = Math.abs(num);
            num = num.toFixed(2);
            var numSplit = num.split('.');
            var int = numSplit[0];
            var dec = numSplit[1];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            var sign
            var type
            type === 'exp' ?  sign = '-' : sign = '+';

            return sign + ' ' + int + '.' + dec;
        },
        displayMonth: function(){
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
        },
        changedType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ', ' + DOMstrings.inputValue + ', ' + DOMstrings.inputDescription)
            fields.forEach(function(curr){
                curr.classList.toggle('red-focus')
            })
        }

        
    }
})();

var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddFunction);

        document.addEventListener('keypress', function(event){
           if(event.keyCode === 13 || event.which === 13){
               ctrlAddFunction();
           }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function(){
        // calculate the budget
        budgetCtrl.calculateBudget()

        // return the budget
        var budget = budgetCtrl.getBudget();

        // display the budgey on UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddFunction = function(){

        // get input field data
        var input = UICtrl.getInput();
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){

        // add item to budget controller
        var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // add item to UI
        UICtrl.addListItem(newItem, input.type);

        // clear the fields
        UIController.clearFields();

        // calculate and update budegt
        updateBudget();
        }
    }

    var ctrlDeleteItem = function(event){
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemId){
            var splitId = itemId.split('-');
            var type = splitId[0];
            var ID = parseInt(splitId[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemId);
            updateBudget();
        }
    }

    return{
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpences: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();