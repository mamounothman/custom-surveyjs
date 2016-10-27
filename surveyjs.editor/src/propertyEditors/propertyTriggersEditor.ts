﻿/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
/// <reference path="propertyItemsEditor.ts" />
module SurveyEditor {
    export class SurveyPropertyTriggersEditor extends SurveyPropertyItemsEditor {
        koQuestions: any; koPages: any;
        public koSelected: any;
        public availableTriggers: Array<string> = [];
        private triggerClasses: Array<Survey.JsonMetadataClass> = [];
        constructor() {
            super();
            var self = this;
            this.onDeleteClick = function () { self.koItems.remove(self.koSelected()); }
            this.onAddClick = function (triggerType) { self.addItem(triggerType); }
            this.koSelected = ko.observable(null);
            this.koPages = ko.observableArray();
            this.koQuestions = ko.observableArray();
            this.triggerClasses = Survey.JsonObject.metaData.getChildrenClasses("surveytrigger", true);
            this.availableTriggers = this.getAvailableTriggers();
        }
        public get editorType(): string { return "triggers"; }
        protected onValueChanged() {
            super.onValueChanged();
            if (this.object) {
                this.koPages(this.getNames((<Survey.Survey>this.object).pages));
                this.koQuestions(this.getNames((<Survey.Survey>this.object).getAllQuestions()));
            }
            if (this.koSelected) {
                this.koSelected(this.koItems().length > 0 ? this.koItems()[0] : null);
            }
        }

        private addItem(triggerType: string) {
            var trigger = Survey.JsonObject.metaData.createClass(triggerType);
            var triggerItem = this.createPropertyTrigger(trigger);
            this.koItems.push(triggerItem);
            this.koSelected(triggerItem);
        }
        protected createEditorItem(item: any) {
            var jsonObj = new Survey.JsonObject();
            var trigger = Survey.JsonObject.metaData.createClass(item.getType());
            jsonObj.toObject(item, trigger);
            return this.createPropertyTrigger(<Survey.SurveyTrigger>trigger);
        }
        protected createItemFromEditorItem(editorItem: any) {
            var editorTrigger = <SurveyPropertyTrigger>editorItem;
            return editorTrigger.createTrigger();
        }
        private getAvailableTriggers(): Array<string> {
            var result = [];
            for (var i = 0; i < this.triggerClasses.length; i++) {
                result.push(this.triggerClasses[i].name);
            }
            return result;
        }
        private getNames(items: Array<any>): Array<string> {
            var names = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item["name"]) {
                    names.push(item["name"]);
                }
            }
            return names;
        }
        private createPropertyTrigger(trigger: Survey.SurveyTrigger): SurveyPropertyTrigger {
            var triggerItem = null;
            if (trigger.getType() == "visibletrigger") {
                triggerItem = new SurveyPropertyVisibleTrigger(<Survey.SurveyTriggerVisible>trigger, this.koPages, this.koQuestions);
            }
            if (trigger.getType() == "setvaluetrigger") {
                triggerItem = new SurveyPropertySetValueTrigger(<Survey.SurveyTriggerSetValue>trigger, this.koQuestions);
            }
            if (!triggerItem) {
                triggerItem = new SurveyPropertyTrigger(trigger);
            }
            return triggerItem;
        }
    }
    export class SurveyPropertyTrigger {
        private operators = ["empty", "notempty", "equal", "notequal", "contains", "notcontains", "greater", "less", "greaterorequal", "lessorequal"];
        private triggerType: string;
        availableOperators = [];
        koName: any; koOperator: any; koValue: any; koType: any;
        koText: any; koIsValid: any; koRequireValue: any;

        constructor(public trigger: Survey.SurveyTrigger) {
            this.createOperators();
            this.triggerType = trigger.getType();
            this.koType = ko.observable(this.triggerType);
            this.koName = ko.observable(trigger.name);
            this.koOperator = ko.observable(trigger.operator);
            this.koValue = ko.observable(trigger.value);
            var self = this;
            this.koRequireValue = ko.computed(() => { return self.koOperator() != "empty" && self.koOperator() != "notempty"; });
            this.koIsValid = ko.computed(() => { if (self.koName() && (!self.koRequireValue() || self.koValue())) return true; return false; });
            this.koText = ko.computed(() => { self.koName(); self.koOperator(); self.koValue(); return self.getText(); });
        }
        public createTrigger(): Survey.SurveyTrigger {
            var trigger = <Survey.SurveyTrigger>Survey.JsonObject.metaData.createClass(this.triggerType);
            trigger.name = this.koName();
            trigger.operator = this.koOperator();
            trigger.value = this.koValue();
            return trigger;
        }
        private createOperators() {
            for (var i = 0; i < this.operators.length; i++) {
                var name = this.operators[i];
                this.availableOperators.push({ name: name, text: editorLocalization.getString("op." + name) });
            }
        }
        private getText(): string {
            if (!this.koIsValid()) return editorLocalization.getString("pe.triggerNotSet");
            return editorLocalization.getString("pe.triggerRunIf") + " '" + this.koName() + "' " + this.getOperatorText() + this.getValueText();
        }
        private getOperatorText(): string {
            var op = this.koOperator();
            for (var i = 0; i < this.availableOperators.length; i++) {
                if (this.availableOperators[i].name == op) return this.availableOperators[i].text;
            }
            return op;
        }
        private getValueText(): string {
            if (!this.koRequireValue()) return "";
            return " " + this.koValue();
        }
    }

    export class SurveyPropertyVisibleTrigger extends SurveyPropertyTrigger {
        public pages: SurveyPropertyTriggerObjects;
        public questions: SurveyPropertyTriggerObjects;
        constructor(public trigger: Survey.SurveyTriggerVisible, koPages: any, koQuestions: any) {
            super(trigger);
            this.pages = new SurveyPropertyTriggerObjects(editorLocalization.getString("pe.triggerMakePagesVisible"), koPages(), trigger.pages);
            this.questions = new SurveyPropertyTriggerObjects(editorLocalization.getString("pe.triggerMakeQuestionsVisible"), koQuestions(), trigger.questions);
        }
        public createTrigger(): Survey.SurveyTrigger {
            var trigger = <Survey.SurveyTriggerVisible>super.createTrigger();
            trigger.pages = this.pages.koChoosen();
            trigger.questions = this.questions.koChoosen();
            return trigger;
        }
    }

    export class SurveyPropertySetValueTrigger extends SurveyPropertyTrigger {
        koQuestions: any; kosetToName: any; kosetValue: any; koisVariable: any;
        constructor(public trigger: Survey.SurveyTriggerSetValue, koQuestions: any) {
            super(trigger);
            this.koQuestions = koQuestions;
            this.kosetToName = ko.observable(trigger.setToName);
            this.kosetValue = ko.observable(trigger.setValue);
            this.koisVariable = ko.observable(trigger.isVariable);
        }
        public createTrigger(): Survey.SurveyTrigger {
            var trigger = <Survey.SurveyTriggerSetValue>super.createTrigger();
            trigger.setToName = this.kosetToName();
            trigger.setValue = this.kosetValue();
            trigger.isVariable = this.koisVariable();
            return trigger;
        }
    }
    export class SurveyPropertyTriggerObjects {
        koObjects: any;
        koChoosen: any;
        koSelected: any;
        koChoosenSelected: any;
        public onDeleteClick: any;
        public onAddClick: any;
        constructor(public title: string, allObjects: Array<string>, choosenObjects: Array<string>) {
            this.koChoosen = ko.observableArray(choosenObjects);
            var array = [];
            for (var i = 0; i < allObjects.length; i++) {
                var item = allObjects[i];
                if (choosenObjects.indexOf(item) < 0) {
                    array.push(item);
                }
            }
            this.koObjects = ko.observableArray(array);
            this.koSelected = ko.observable();
            this.koChoosenSelected = ko.observable();
            var self = this;
            this.onDeleteClick = function () { self.deleteItem(); }
            this.onAddClick = function () { self.addItem(); }
        }
        private deleteItem() {
            this.changeItems(this.koChoosenSelected(), this.koChoosen, this.koObjects);
        }
        private addItem() {
            this.changeItems(this.koSelected(), this.koObjects, this.koChoosen);
        }
        private changeItems(item: string, removedFrom: any, addTo: any) {
            removedFrom.remove(item);
            addTo.push(item);
            removedFrom.sort();
            addTo.sort();
        }
    }

    SurveyPropertyEditorBase.registerEditor("triggers", function (): SurveyPropertyEditorBase { return new SurveyPropertyTriggersEditor(); });
}