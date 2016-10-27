/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    var DragDropHelper = (function () {
        function DragDropHelper(data, onModifiedCallback) {
            this.data = data;
            this.onModifiedCallback = onModifiedCallback;
        }
        Object.defineProperty(DragDropHelper.prototype, "survey", {
            get: function () { return this.data; },
            enumerable: true,
            configurable: true
        });
        DragDropHelper.prototype.startDragNewQuestion = function (event, questionType, questionName) {
            this.setData(event, DragDropHelper.dataStart + "questiontype:" + questionType + ",questionname:" + questionName);
        };
        DragDropHelper.prototype.startDragQuestion = function (event, questionName) {
            this.setData(event, DragDropHelper.dataStart + "questionname:" + questionName);
        };
        DragDropHelper.prototype.startDragCopiedQuestion = function (event, questionName, questionJson) {
            this.setData(event, DragDropHelper.dataStart + "questionname:" + questionName, questionJson);
        };
        DragDropHelper.prototype.isSurveyDragging = function (event) {
            if (!event)
                return false;
            var data = this.getData(event).text;
            return data && data.indexOf(DragDropHelper.dataStart) == 0;
        };
        DragDropHelper.prototype.doDragDropOver = function (event, question) {
            event = this.getEvent(event);
            if (!question || !this.isSurveyDragging(event) || this.isSamePlace(event, question))
                return;
            var index = this.getQuestionIndex(event, question);
            this.survey.currentPage["koDragging"](index);
        };
        DragDropHelper.prototype.doDrop = function (event, question) {
            if (question === void 0) { question = null; }
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (!this.isSurveyDragging(event))
                return;
            this.survey.currentPage["koDragging"](-1);
            var index = this.getQuestionIndex(event, question);
            var dataInfo = this.getDataInfo(event);
            this.clearData();
            if (!dataInfo)
                return;
            var targetQuestion = null;
            var json = dataInfo["json"];
            if (json) {
                targetQuestion = Survey.QuestionFactory.Instance.createQuestion(json["type"], name);
                new Survey.JsonObject().toObject(json, targetQuestion);
                targetQuestion.name = dataInfo["questionname"];
            }
            if (!targetQuestion) {
                targetQuestion = this.survey.getQuestionByName(dataInfo["questionname"]);
            }
            if (!targetQuestion && dataInfo["questiontype"]) {
                targetQuestion = Survey.QuestionFactory.Instance.createQuestion(dataInfo["questiontype"], dataInfo["questionname"]);
            }
            if (!targetQuestion)
                return;
            this.moveQuestionTo(targetQuestion, index);
        };
        DragDropHelper.prototype.getQuestionIndex = function (event, question) {
            var page = this.survey.currentPage;
            if (!question)
                return page.questions.length;
            var index = page.questions.indexOf(question);
            event = this.getEvent(event);
            var height = event.currentTarget["clientHeight"];
            var y = event.offsetY;
            if (event.hasOwnProperty('layerX')) {
                y = event.layerY - event.currentTarget["offsetTop"];
            }
            if (y > height / 2)
                index++;
            return index;
        };
        DragDropHelper.prototype.isSamePlace = function (event, question) {
            var prev = DragDropHelper.prevEvent;
            if (prev.question != question || Math.abs(event.clientX - prev.x) > 5 || Math.abs(event.clientY - prev.y) > 5) {
                prev.question = question;
                prev.x = event.clientX;
                prev.y = event.clientY;
                return false;
            }
            return true;
        };
        DragDropHelper.prototype.getEvent = function (event) {
            return event["originalEvent"] ? event["originalEvent"] : event;
        };
        DragDropHelper.prototype.moveQuestionTo = function (targetQuestion, index) {
            if (targetQuestion == null)
                return;
            var page = this.survey.getPageByQuestion(targetQuestion);
            if (page) {
                page.removeQuestion(targetQuestion);
            }
            this.survey.currentPage.addQuestion(targetQuestion, index);
            if (this.onModifiedCallback)
                this.onModifiedCallback();
        };
        DragDropHelper.prototype.getDataInfo = function (event) {
            var data = this.getData(event);
            if (!data)
                return null;
            var text = data.text.substr(DragDropHelper.dataStart.length);
            var array = text.split(',');
            var result = { json: null };
            for (var i = 0; i < array.length; i++) {
                var item = array[i].split(':');
                result[item[0]] = item[1];
            }
            result.json = data.json;
            return result;
        };
        DragDropHelper.prototype.getY = function (element) {
            var result = 0;
            while (element) {
                result += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return result;
        };
        DragDropHelper.prototype.setData = function (event, text, json) {
            if (json === void 0) { json = null; }
            if (event["originalEvent"]) {
                event = event["originalEvent"];
            }
            if (event.dataTransfer) {
                event.dataTransfer.setData("Text", text);
                event.dataTransfer.effectAllowed = "copy";
            }
            DragDropHelper.dragData = { text: text, json: json };
        };
        DragDropHelper.prototype.getData = function (event) {
            if (event["originalEvent"]) {
                event = event["originalEvent"];
            }
            if (event.dataTransfer) {
                var text = event.dataTransfer.getData("Text");
                if (text) {
                    DragDropHelper.dragData.text = text;
                }
            }
            return DragDropHelper.dragData;
        };
        DragDropHelper.prototype.clearData = function () {
            DragDropHelper.dragData = { text: "", json: null };
            var prev = DragDropHelper.prevEvent;
            prev.question = null;
            prev.x = -1;
            prev.y = -1;
        };
        DragDropHelper.dataStart = "surveyjs,";
        DragDropHelper.dragData = { text: "", json: null };
        DragDropHelper.prevEvent = { question: null, x: -1, y: -1 };
        return DragDropHelper;
    }());
    SurveyEditor.DragDropHelper = DragDropHelper;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyEditorBase = (function () {
        function SurveyPropertyEditorBase() {
            this.value_ = null;
            this.options = null;
        }
        SurveyPropertyEditorBase.registerEditor = function (name, creator) {
            SurveyPropertyEditorBase.editorRegisteredList[name] = creator;
        };
        SurveyPropertyEditorBase.createEditor = function (editorType, func) {
            var creator = SurveyPropertyEditorBase.editorRegisteredList[editorType];
            if (!creator)
                creator = SurveyPropertyEditorBase.editorRegisteredList[SurveyPropertyEditorBase.defaultEditor];
            var propertyEditor = creator();
            propertyEditor.onChanged = func;
            return propertyEditor;
        };
        Object.defineProperty(SurveyPropertyEditorBase.prototype, "editorType", {
            get: function () { throw "editorType is not defined"; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyEditorBase.prototype.getValueText = function (value) { return value; };
        Object.defineProperty(SurveyPropertyEditorBase.prototype, "value", {
            get: function () { return this.value_; },
            set: function (value) {
                value = this.getCorrectedValue(value);
                this.setValueCore(value);
                this.onValueChanged();
            },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyEditorBase.prototype.setValueCore = function (value) {
            this.value_ = value;
        };
        SurveyPropertyEditorBase.prototype.setTitle = function (value) { };
        SurveyPropertyEditorBase.prototype.setObject = function (value) { };
        SurveyPropertyEditorBase.prototype.onValueChanged = function () {
        };
        SurveyPropertyEditorBase.prototype.getCorrectedValue = function (value) { return value; };
        SurveyPropertyEditorBase.defaultEditor = "string";
        SurveyPropertyEditorBase.editorRegisteredList = {};
        return SurveyPropertyEditorBase;
    }());
    SurveyEditor.SurveyPropertyEditorBase = SurveyPropertyEditorBase;
    var SurveyStringPropertyEditor = (function (_super) {
        __extends(SurveyStringPropertyEditor, _super);
        function SurveyStringPropertyEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyStringPropertyEditor.prototype, "editorType", {
            get: function () { return "string"; },
            enumerable: true,
            configurable: true
        });
        return SurveyStringPropertyEditor;
    }(SurveyPropertyEditorBase));
    SurveyEditor.SurveyStringPropertyEditor = SurveyStringPropertyEditor;
    var SurveyDropdownPropertyEditor = (function (_super) {
        __extends(SurveyDropdownPropertyEditor, _super);
        function SurveyDropdownPropertyEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyDropdownPropertyEditor.prototype, "editorType", {
            get: function () { return "dropdown"; },
            enumerable: true,
            configurable: true
        });
        return SurveyDropdownPropertyEditor;
    }(SurveyPropertyEditorBase));
    SurveyEditor.SurveyDropdownPropertyEditor = SurveyDropdownPropertyEditor;
    var SurveyBooleanPropertyEditor = (function (_super) {
        __extends(SurveyBooleanPropertyEditor, _super);
        function SurveyBooleanPropertyEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyBooleanPropertyEditor.prototype, "editorType", {
            get: function () { return "boolean"; },
            enumerable: true,
            configurable: true
        });
        return SurveyBooleanPropertyEditor;
    }(SurveyPropertyEditorBase));
    SurveyEditor.SurveyBooleanPropertyEditor = SurveyBooleanPropertyEditor;
    var SurveyNumberPropertyEditor = (function (_super) {
        __extends(SurveyNumberPropertyEditor, _super);
        function SurveyNumberPropertyEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyNumberPropertyEditor.prototype, "editorType", {
            get: function () { return "number"; },
            enumerable: true,
            configurable: true
        });
        return SurveyNumberPropertyEditor;
    }(SurveyPropertyEditorBase));
    SurveyEditor.SurveyNumberPropertyEditor = SurveyNumberPropertyEditor;
    SurveyPropertyEditorBase.registerEditor("string", function () { return new SurveyStringPropertyEditor(); });
    SurveyPropertyEditorBase.registerEditor("dropdown", function () { return new SurveyDropdownPropertyEditor(); });
    SurveyPropertyEditorBase.registerEditor("boolean", function () { return new SurveyBooleanPropertyEditor(); });
    SurveyPropertyEditorBase.registerEditor("number", function () { return new SurveyNumberPropertyEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
/// <reference path="propertyEditors/propertyEditorBase.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyObjectProperty = (function () {
        function SurveyObjectProperty(property, onPropertyChanged, propertyEditorOptions) {
            if (onPropertyChanged === void 0) { onPropertyChanged = null; }
            if (propertyEditorOptions === void 0) { propertyEditorOptions = null; }
            this.property = property;
            this.isApplyingNewValue = false;
            this.onPropertyChanged = onPropertyChanged;
            this.name = this.property.name;
            this.koValue = ko.observable();
            this.choices = property.choices;
            var self = this;
            this.editorType = property.type;
            //TODO
            if (this.choices != null) {
                this.editorType = "dropdown";
            }
            var onItemChanged = function (newValue) { self.onApplyEditorValue(newValue); };
            this.editor = SurveyEditor.SurveyPropertyEditorBase.createEditor(this.editorType, onItemChanged);
            this.editor.options = propertyEditorOptions;
            this.editorType = this.editor.editorType;
            this.modalName = "modelEditor" + this.editorType + this.name;
            this.modalNameTarget = "#" + this.modalName;
            this.koValue.subscribe(function (newValue) { self.onkoValueChanged(newValue); });
            this.koText = ko.computed(function () { return self.getValueText(self.koValue()); });
            this.koIsDefault = ko.computed(function () { return self.property.isDefaultValue(self.koValue()); });
        }
        Object.defineProperty(SurveyObjectProperty.prototype, "object", {
            get: function () { return this.objectValue; },
            set: function (value) {
                this.objectValue = value;
                this.updateValue();
            },
            enumerable: true,
            configurable: true
        });
        SurveyObjectProperty.prototype.updateValue = function () {
            this.isValueUpdating = true;
            this.koValue(this.getValue());
            this.editor.setObject(this.object);
            this.editor.setTitle(SurveyEditor.editorLocalization.getString("pe.editProperty")["format"](this.property.name));
            this.updateEditorData(this.koValue());
            this.isValueUpdating = false;
        };
        SurveyObjectProperty.prototype.onApplyEditorValue = function (newValue) {
            this.isApplyingNewValue = true;
            this.koValue(newValue);
            this.isApplyingNewValue = false;
        };
        SurveyObjectProperty.prototype.onkoValueChanged = function (newValue) {
            if (!this.isApplyingNewValue) {
                this.updateEditorData(newValue);
            }
            if (this.object == null)
                return;
            if (this.object[this.name] == newValue)
                return;
            if (this.onPropertyChanged != null && !this.isValueUpdating)
                this.onPropertyChanged(this, newValue);
        };
        SurveyObjectProperty.prototype.updateEditorData = function (newValue) {
            this.editor.value = newValue;
        };
        SurveyObjectProperty.prototype.getValue = function () {
            if (this.property.hasToUseGetValue)
                return this.property.getValue(this.object);
            return this.object[this.name];
        };
        SurveyObjectProperty.prototype.getValueText = function (value) { return this.editor.getValueText(value); };
        return SurveyObjectProperty;
    }());
    SurveyEditor.SurveyObjectProperty = SurveyObjectProperty;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
/// <reference path="objectProperty.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyObjectEditor = (function () {
        function SurveyObjectEditor(propertyEditorOptions) {
            if (propertyEditorOptions === void 0) { propertyEditorOptions = null; }
            this.propertyEditorOptions = null;
            this.onPropertyValueChanged = new Survey.Event();
            this.propertyEditorOptions = propertyEditorOptions;
            this.koProperties = ko.observableArray();
            this.koActiveProperty = ko.observable();
            this.koHasObject = ko.observable();
        }
        Object.defineProperty(SurveyObjectEditor.prototype, "selectedObject", {
            get: function () { return this.selectedObjectValue; },
            set: function (value) {
                if (this.selectedObjectValue == value)
                    return;
                this.koHasObject(value != null);
                this.selectedObjectValue = value;
                this.updateProperties();
                this.updatePropertiesObject();
            },
            enumerable: true,
            configurable: true
        });
        SurveyObjectEditor.prototype.getPropertyEditor = function (name) {
            var properties = this.koProperties();
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].name == name)
                    return properties[i];
            }
            return null;
        };
        SurveyObjectEditor.prototype.changeActiveProperty = function (property) {
            this.koActiveProperty(property);
        };
        SurveyObjectEditor.prototype.ObjectChanged = function () {
            this.updatePropertiesObject();
        };
        SurveyObjectEditor.prototype.updateProperties = function () {
            var _this = this;
            if (!this.selectedObject || !this.selectedObject.getType) {
                this.koProperties([]);
                this.koActiveProperty(null);
                return;
            }
            var properties = Survey.JsonObject.metaData.getProperties(this.selectedObject.getType());
            properties.sort(function (a, b) {
                if (a.name == b.name)
                    return 0;
                if (a.name > b.name)
                    return 1;
                return -1;
            });
            var objectProperties = [];
            var self = this;
            var propEvent = function (property, newValue) {
                self.onPropertyValueChanged.fire(_this, { property: property.property, object: property.object, newValue: newValue });
            };
            for (var i = 0; i < properties.length; i++) {
                if (!this.canShowProperty(properties[i]))
                    continue;
                var objectProperty = new SurveyEditor.SurveyObjectProperty(properties[i], propEvent, this.propertyEditorOptions);
                var locName = this.selectedObject.getType() + '_' + properties[i].name;
                objectProperty.displayName = SurveyEditor.editorLocalization.getPropertyName(locName);
                var title = SurveyEditor.editorLocalization.getPropertyTitle(locName);
                if (!title)
                    title = objectProperty.displayName;
                objectProperty.title = title;
                objectProperties.push(objectProperty);
            }
            this.koProperties(objectProperties);
            this.koActiveProperty(this.getPropertyEditor("name"));
        };
        SurveyObjectEditor.prototype.canShowProperty = function (property) {
            var name = property.name;
            if (name == 'questions' || name == 'pages')
                return false;
            return true;
        };
        SurveyObjectEditor.prototype.updatePropertiesObject = function () {
            var properties = this.koProperties();
            for (var i = 0; i < properties.length; i++) {
                properties[i].object = this.selectedObject;
            }
        };
        return SurveyObjectEditor;
    }());
    SurveyEditor.SurveyObjectEditor = SurveyObjectEditor;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPagesEditor = (function () {
        function SurveyPagesEditor(onAddNewPageCallback, onSelectPageCallback, onMovePageCallback, onDeletePageCallback) {
            if (onAddNewPageCallback === void 0) { onAddNewPageCallback = null; }
            if (onSelectPageCallback === void 0) { onSelectPageCallback = null; }
            if (onMovePageCallback === void 0) { onMovePageCallback = null; }
            if (onDeletePageCallback === void 0) { onDeletePageCallback = null; }
            this.draggingPage = null;
            this.koPages = ko.observableArray();
            this.koIsValid = ko.observable(false);
            this.onAddNewPageCallback = onAddNewPageCallback;
            this.onSelectPageCallback = onSelectPageCallback;
            this.onMovePageCallback = onMovePageCallback;
            this.onDeletePageCallback = onDeletePageCallback;
            var self = this;
            this.selectPageClick = function (pageItem) {
                if (self.onSelectPageCallback) {
                    self.onSelectPageCallback(pageItem.page);
                }
            };
            this.keyDown = function (el, e) { self.onKeyDown(el, e); };
            this.dragStart = function (el) { self.draggingPage = el; };
            this.dragOver = function (el) { };
            this.dragEnd = function () { self.draggingPage = null; };
            this.dragDrop = function (el) { self.moveDraggingPageTo(el); };
        }
        Object.defineProperty(SurveyPagesEditor.prototype, "survey", {
            get: function () { return this.surveyValue; },
            set: function (value) {
                this.surveyValue = value;
                this.koIsValid(this.surveyValue != null);
                this.updatePages();
            },
            enumerable: true,
            configurable: true
        });
        SurveyPagesEditor.prototype.setSelectedPage = function (page) {
            var pages = this.koPages();
            for (var i = 0; i < pages.length; i++) {
                pages[i].koSelected(pages[i].page == page);
            }
        };
        SurveyPagesEditor.prototype.addNewPageClick = function () {
            if (this.onAddNewPageCallback) {
                this.onAddNewPageCallback();
            }
        };
        SurveyPagesEditor.prototype.removePage = function (page) {
            var index = this.getIndexByPage(page);
            if (index > -1) {
                this.koPages.splice(index, 1);
            }
        };
        SurveyPagesEditor.prototype.changeName = function (page) {
            var index = this.getIndexByPage(page);
            if (index > -1) {
                this.koPages()[index].title(SurveyEditor.SurveyHelper.getObjectName(page));
            }
        };
        SurveyPagesEditor.prototype.getIndexByPage = function (page) {
            var pages = this.koPages();
            for (var i = 0; i < pages.length; i++) {
                if (pages[i].page == page)
                    return i;
            }
            return -1;
        };
        SurveyPagesEditor.prototype.onKeyDown = function (el, e) {
            if (this.koPages().length <= 1)
                return;
            var pages = this.koPages();
            var pageIndex = -1;
            for (var i = 0; i < pages.length; i++) {
                if (pages[i].page && pages[i].koSelected()) {
                    pageIndex = i;
                }
            }
            if (pageIndex < 0)
                return;
            if (e.keyCode == 46 && this.onDeletePageCallback)
                this.onDeletePageCallback(el.page);
            if ((e.keyCode == 37 || e.keyCode == 39) && this.onSelectPageCallback) {
                pageIndex += (e.keyCode == 37 ? -1 : 1);
                if (pageIndex < 0)
                    pageIndex = pages.length - 1;
                if (pageIndex >= pages.length)
                    pageIndex = 0;
                var page = pages[pageIndex].page;
                this.onSelectPageCallback(page);
                this.setSelectedPage(page);
            }
        };
        SurveyPagesEditor.prototype.updatePages = function () {
            if (this.surveyValue == null) {
                this.koPages([]);
                return;
            }
            var pages = [];
            for (var i = 0; i < this.surveyValue.pages.length; i++) {
                var page = this.surveyValue.pages[i];
                pages.push({
                    title: ko.observable(SurveyEditor.SurveyHelper.getObjectName(page)), page: page, koSelected: ko.observable(false)
                });
            }
            this.koPages(pages);
        };
        SurveyPagesEditor.prototype.moveDraggingPageTo = function (toPage) {
            if (toPage == null || toPage == this.draggingPage) {
                this.draggingPage = null;
                return;
            }
            if (this.draggingPage == null)
                return;
            var index = this.koPages().indexOf(this.draggingPage);
            var indexTo = this.koPages().indexOf(toPage);
            if (this.onMovePageCallback) {
                this.onMovePageCallback(index, indexTo);
            }
        };
        return SurveyPagesEditor;
    }());
    SurveyEditor.SurveyPagesEditor = SurveyPagesEditor;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    var TextParserPropery = (function () {
        function TextParserPropery() {
        }
        return TextParserPropery;
    }());
    var SurveyTextWorker = (function () {
        function SurveyTextWorker(text) {
            this.text = text;
            if (!this.text || this.text.trim() == "") {
                this.text = "{}";
            }
            this.errors = [];
            this.process();
        }
        Object.defineProperty(SurveyTextWorker.prototype, "survey", {
            get: function () { return this.surveyValue; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyTextWorker.prototype, "isJsonCorrect", {
            get: function () { return this.surveyValue != null; },
            enumerable: true,
            configurable: true
        });
        SurveyTextWorker.prototype.process = function () {
            try {
                this.jsonValue = new SurveyEditor.SurveyJSON5(1).parse(this.text);
            }
            catch (error) {
                this.errors.push({ pos: { start: error.at, end: -1 }, text: error.message });
            }
            if (this.jsonValue != null) {
                this.updateJsonPositions(this.jsonValue);
                this.surveyValue = new Survey.Survey(this.jsonValue);
                if (this.surveyValue.jsonErrors != null) {
                    for (var i = 0; i < this.surveyValue.jsonErrors.length; i++) {
                        var error = this.surveyValue.jsonErrors[i];
                        this.errors.push({ pos: { start: error.at, end: -1 }, text: error.getFullDescription() });
                    }
                }
            }
            this.surveyObjects = this.createSurveyObjects();
            this.setEditorPositionByChartAt(this.surveyObjects);
            this.setEditorPositionByChartAt(this.errors);
        };
        SurveyTextWorker.prototype.updateJsonPositions = function (jsonObj) {
            jsonObj["pos"]["self"] = jsonObj;
            for (var key in jsonObj) {
                var obj = jsonObj[key];
                if (obj && obj["pos"]) {
                    jsonObj["pos"][key] = obj["pos"];
                    this.updateJsonPositions(obj);
                }
            }
        };
        SurveyTextWorker.prototype.createSurveyObjects = function () {
            var result = [];
            if (this.surveyValue == null)
                return result;
            this.isSurveyAsPage = false;
            for (var i = 0; i < this.surveyValue.pages.length; i++) {
                var page = this.surveyValue.pages[i];
                if (i == 0 && !page["pos"]) {
                    page["pos"] = this.surveyValue["pos"];
                    this.isSurveyAsPage = true;
                }
                result.push(page);
                for (var j = 0; j < page.questions.length; j++) {
                    result.push(page.questions[j]);
                }
            }
            return result;
        };
        SurveyTextWorker.prototype.setEditorPositionByChartAt = function (objects) {
            if (objects == null || objects.length == 0)
                return;
            var position = { row: 0, column: 0 };
            var atObjectsArray = this.getAtArray(objects);
            var startAt = 0;
            for (var i = 0; i < atObjectsArray.length; i++) {
                var at = atObjectsArray[i].at;
                position = this.getPostionByChartAt(position, startAt, at);
                var obj = atObjectsArray[i].obj;
                if (!obj.position)
                    obj.position = {};
                if (at == obj.pos.start) {
                    obj.position.start = position;
                }
                else {
                    if (at == obj.pos.end) {
                        obj.position.end = position;
                    }
                }
                startAt = at;
            }
        };
        SurveyTextWorker.prototype.getPostionByChartAt = function (startPosition, startAt, at) {
            var result = { row: startPosition.row, column: startPosition.column };
            var curChar = startAt;
            while (curChar < at) {
                if (this.text.charAt(curChar) == SurveyTextWorker.newLineChar) {
                    result.row++;
                    result.column = 0;
                }
                else {
                    result.column++;
                }
                curChar++;
            }
            return result;
        };
        SurveyTextWorker.prototype.getAtArray = function (objects) {
            var result = [];
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                var pos = obj.pos;
                if (!pos)
                    continue;
                result.push({ at: pos.start, obj: obj });
                if (pos.end > 0) {
                    result.push({ at: pos.end, obj: obj });
                }
            }
            return result.sort(function (el1, el2) {
                if (el1.at > el2.at)
                    return 1;
                if (el1.at < el2.at)
                    return -1;
                return 0;
            });
        };
        return SurveyTextWorker;
    }());
    SurveyEditor.SurveyTextWorker = SurveyTextWorker;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    (function (ObjType) {
        ObjType[ObjType["Unknown"] = 0] = "Unknown";
        ObjType[ObjType["Survey"] = 1] = "Survey";
        ObjType[ObjType["Page"] = 2] = "Page";
        ObjType[ObjType["Question"] = 3] = "Question";
    })(SurveyEditor.ObjType || (SurveyEditor.ObjType = {}));
    var ObjType = SurveyEditor.ObjType;
    var SurveyHelper = (function () {
        function SurveyHelper() {
        }
        SurveyHelper.getNewPageName = function (objs) {
            return SurveyHelper.getNewName(objs, SurveyEditor.editorLocalization.getString("ed.newPageName"));
        };
        SurveyHelper.getNewQuestionName = function (objs) {
            return SurveyHelper.getNewName(objs, SurveyEditor.editorLocalization.getString("ed.newQuestionName"));
        };
        SurveyHelper.getNewName = function (objs, baseName) {
            var hash = {};
            for (var i = 0; i < objs.length; i++) {
                hash[objs[i].name] = true;
            }
            var num = 1;
            while (true) {
                if (!hash[baseName + num.toString()])
                    break;
                num++;
            }
            return baseName + num.toString();
        };
        SurveyHelper.getObjectType = function (obj) {
            if (!obj || !obj["getType"])
                return ObjType.Unknown;
            if (obj.getType() == "page")
                return ObjType.Page;
            if (obj.getType() == "survey")
                return ObjType.Survey;
            if (obj["name"])
                return ObjType.Question;
            return ObjType.Unknown;
        };
        SurveyHelper.getObjectName = function (obj) {
            if (obj["name"])
                return obj["name"];
            var objType = SurveyHelper.getObjectType(obj);
            if (objType != ObjType.Page)
                return "";
            var data = obj.data;
            var index = data.pages.indexOf(obj);
            return "[Page " + (index + 1) + "]";
        };
        return SurveyHelper;
    }());
    SurveyEditor.SurveyHelper = SurveyHelper;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyEmbedingWindow = (function () {
        function SurveyEmbedingWindow() {
            this.surveyId = null;
            this.surveyPostId = null;
            this.generateValidJSON = false;
            var self = this;
            this.koLibraryVersion = ko.observable("knockout");
            this.koShowAsWindow = ko.observable("page");
            this.koScriptUsing = ko.observable("bootstrap");
            this.koHasIds = ko.observable(false);
            this.koLoadSurvey = ko.observable(false);
            this.koVisibleHtml = ko.computed(function () { return self.koLibraryVersion() == "react" || self.koShowAsWindow() == "page"; });
            this.koLibraryVersion.subscribe(function (newValue) { self.setHeadText(); self.surveyEmbedingJava.setValue(self.getJavaText()); });
            this.koShowAsWindow.subscribe(function (newValue) { self.surveyEmbedingJava.setValue(self.getJavaText()); });
            this.koScriptUsing.subscribe(function (newValue) { self.setHeadText(); });
            this.koLoadSurvey.subscribe(function (newValue) { self.surveyEmbedingJava.setValue(self.getJavaText()); });
            this.surveyEmbedingHead = null;
        }
        Object.defineProperty(SurveyEmbedingWindow.prototype, "json", {
            get: function () { return this.jsonValue; },
            set: function (value) { this.jsonValue = value; },
            enumerable: true,
            configurable: true
        });
        SurveyEmbedingWindow.prototype.show = function () {
            if (this.surveyEmbedingHead == null) {
                this.surveyEmbedingHead = this.createEditor("surveyEmbedingHead");
                this.setHeadText();
                var bodyEditor = this.createEditor("surveyEmbedingBody");
                bodyEditor.setValue("<div id= \"mySurveyJSName\" ></div>");
                this.surveyEmbedingJava = this.createEditor("surveyEmbedingJava");
            }
            this.koHasIds(this.surveyId && this.surveyPostId);
            this.surveyEmbedingJava.setValue(this.getJavaText());
        };
        SurveyEmbedingWindow.prototype.setHeadText = function () {
            if (this.koLibraryVersion() == "knockout") {
                var knockoutStr = "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-min.js\" ></script>\n";
                if (this.koScriptUsing() == "bootstrap") {
                    this.surveyEmbedingHead.setValue(knockoutStr + "<script src=\"js/survey.bootstrap.min.js\"></script>");
                }
                else {
                    this.surveyEmbedingHead.setValue(knockoutStr + "<script src=\"js/survey.min.js\"></script>\n<link href=\"css/survey.css\" type=\"text/css\" rel=\"stylesheet\" />");
                }
            }
            else {
                var knockoutStr = "<script src=\"https://fb.me/react-0.14.8.js\"></script>\n<script src= \"https://fb.me/react-dom-0.14.8.js\"></script>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js\"></script>\n";
                if (this.koScriptUsing() == "bootstrap") {
                    this.surveyEmbedingHead.setValue(knockoutStr + "<script src=\"js/survey.react.bootstrap.min.js\"></script>");
                }
                else {
                    this.surveyEmbedingHead.setValue(knockoutStr + "<script src=\"js/survey.react.min.js\"></script>\n<link href=\"css/survey.css\" type=\"text/css\" rel=\"stylesheet\" />");
                }
            }
        };
        SurveyEmbedingWindow.prototype.createEditor = function (elementName) {
            var editor = ace.edit(elementName);
            editor.setTheme("ace/theme/monokai");
            editor.session.setMode("ace/mode/json");
            editor.setShowPrintMargin(false);
            editor.renderer.setShowGutter(false);
            editor.setReadOnly(true);
            return editor;
        };
        SurveyEmbedingWindow.prototype.getJavaText = function () {
            var isOnPage = this.koShowAsWindow() == "page";
            if (this.koLibraryVersion() == "knockout")
                return this.getKnockoutJavaText(isOnPage);
            return this.getReactJavaText(isOnPage);
        };
        SurveyEmbedingWindow.prototype.getKnockoutJavaText = function (isOnPage) {
            var text = isOnPage ? "var survey = new Survey.Survey(\n" : "var surveyWindow = new Survey.SurveyWindow(\n";
            text += this.getJsonText();
            text += ");\n";
            if (!isOnPage) {
                text += "surveyWindow.";
            }
            var saveFunc = this.getSaveFuncCode();
            text += "survey.onComplete.add(function (s) {\n" + saveFunc + "\n });\n";
            if (isOnPage) {
                text += "survey.render(\"mySurveyJSName\");";
            }
            else {
                text += "//By default Survey.title is used.\n";
                text += "//surveyWindow.title = \"My Survey Window Title.\";\n";
                text += "surveyWindow.show();";
            }
            return text;
        };
        SurveyEmbedingWindow.prototype.getReactJavaText = function (isOnPage) {
            var saveFunc = this.getSaveFuncCode();
            var sendResultText = "var surveySendResult = function (s) {\n" + saveFunc + "\n });\n";
            var name = isOnPage ? "ReactSurvey" : "ReactSurveyWindow";
            var jsonText = "var surveyJson = " + this.getJsonText() + "\n\n";
            var text = jsonText + sendResultText + "ReactDOM.render(\n<" + name + " json={surveyJson} onComplete={surveySendResult} />, \n document.getElementById(\"mySurveyJSName\"));";
            return text;
        };
        SurveyEmbedingWindow.prototype.getSaveFuncCode = function () {
            if (this.koHasIds())
                return "survey.sendResult('" + this.surveyPostId + "');";
            return "alert(\"The results are:\" + JSON.stringify(s.data));";
        };
        SurveyEmbedingWindow.prototype.getJsonText = function () {
            if (this.koHasIds() && this.koLoadSurvey()) {
                return "{ surveyId: '" + this.surveyId + "'}";
            }
            if (this.generateValidJSON)
                return JSON.stringify(this.json);
            return new SurveyEditor.SurveyJSON5().stringify(this.json);
        };
        return SurveyEmbedingWindow;
    }());
    SurveyEditor.SurveyEmbedingWindow = SurveyEmbedingWindow;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyVerbs = (function () {
        function SurveyVerbs(onModifiedCallback) {
            this.onModifiedCallback = onModifiedCallback;
            this.koVerbs = ko.observableArray();
            this.koHasVerbs = ko.observable();
            var classes = Survey.JsonObject.metaData.getChildrenClasses("selectbase", true);
            this.choicesClasses = [];
            for (var i = 0; i < classes.length; i++) {
                this.choicesClasses.push(classes[i].name);
            }
        }
        Object.defineProperty(SurveyVerbs.prototype, "survey", {
            get: function () { return this.surveyValue; },
            set: function (value) {
                if (this.survey == value)
                    return;
                this.surveyValue = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyVerbs.prototype, "obj", {
            get: function () { return this.objValue; },
            set: function (value) {
                if (this.objValue == value)
                    return;
                this.objValue = value;
                this.buildVerbs();
            },
            enumerable: true,
            configurable: true
        });
        SurveyVerbs.prototype.buildVerbs = function () {
            var array = [];
            var objType = SurveyEditor.SurveyHelper.getObjectType(this.obj);
            if (objType == SurveyEditor.ObjType.Question) {
                var question = this.obj;
                if (this.survey.pages.length > 1) {
                    array.push(new SurveyVerbChangePageItem(this.survey, question, this.onModifiedCallback));
                }
                if (this.choicesClasses.indexOf(question.getType()) > -1) {
                    array.push(new SurveyVerbChangeTypeItem(this.survey, question, this.onModifiedCallback));
                }
            }
            this.koVerbs(array);
            this.koHasVerbs(array.length > 0);
        };
        return SurveyVerbs;
    }());
    SurveyEditor.SurveyVerbs = SurveyVerbs;
    var SurveyVerbItem = (function () {
        function SurveyVerbItem(survey, question, onModifiedCallback) {
            this.survey = survey;
            this.question = question;
            this.onModifiedCallback = onModifiedCallback;
            this.koItems = ko.observableArray();
            this.koSelectedItem = ko.observable();
        }
        Object.defineProperty(SurveyVerbItem.prototype, "text", {
            get: function () { return ""; },
            enumerable: true,
            configurable: true
        });
        return SurveyVerbItem;
    }());
    SurveyEditor.SurveyVerbItem = SurveyVerbItem;
    var SurveyVerbChangeTypeItem = (function (_super) {
        __extends(SurveyVerbChangeTypeItem, _super);
        function SurveyVerbChangeTypeItem(survey, question, onModifiedCallback) {
            _super.call(this, survey, question, onModifiedCallback);
            this.survey = survey;
            this.question = question;
            this.onModifiedCallback = onModifiedCallback;
            var classes = Survey.JsonObject.metaData.getChildrenClasses("selectbase", true);
            var array = [];
            for (var i = 0; i < classes.length; i++) {
                array.push({ value: classes[i].name, text: SurveyEditor.editorLocalization.getString("qt." + classes[i].name) });
            }
            this.koItems(array);
            this.koSelectedItem(question.getType());
            var self = this;
            this.koSelectedItem.subscribe(function (newValue) { self.changeType(newValue); });
        }
        Object.defineProperty(SurveyVerbChangeTypeItem.prototype, "text", {
            get: function () { return SurveyEditor.editorLocalization.getString("pe.verbChangeType"); },
            enumerable: true,
            configurable: true
        });
        SurveyVerbChangeTypeItem.prototype.changeType = function (questionType) {
            if (questionType == this.question.getType())
                return;
            var page = this.survey.getPageByQuestion(this.question);
            var index = page.questions.indexOf(this.question);
            var newQuestion = Survey.QuestionFactory.Instance.createQuestion(questionType, this.question.name);
            var jsonObj = new Survey.JsonObject();
            var json = jsonObj.toJsonObject(this.question);
            jsonObj.toObject(json, newQuestion);
            page.removeQuestion(this.question);
            page.addQuestion(newQuestion, index);
            if (this.onModifiedCallback)
                this.onModifiedCallback();
        };
        return SurveyVerbChangeTypeItem;
    }(SurveyVerbItem));
    SurveyEditor.SurveyVerbChangeTypeItem = SurveyVerbChangeTypeItem;
    var SurveyVerbChangePageItem = (function (_super) {
        __extends(SurveyVerbChangePageItem, _super);
        function SurveyVerbChangePageItem(survey, question, onModifiedCallback) {
            _super.call(this, survey, question, onModifiedCallback);
            this.survey = survey;
            this.question = question;
            this.onModifiedCallback = onModifiedCallback;
            var array = [];
            for (var i = 0; i < this.survey.pages.length; i++) {
                var page = this.survey.pages[i];
                array.push({ value: page, text: SurveyEditor.SurveyHelper.getObjectName(page) });
            }
            this.koItems(array);
            this.prevPage = this.survey.getPageByQuestion(question);
            this.koSelectedItem(this.prevPage);
            var self = this;
            this.koSelectedItem.subscribe(function (newValue) { self.changePage(newValue); });
        }
        Object.defineProperty(SurveyVerbChangePageItem.prototype, "text", {
            get: function () { return SurveyEditor.editorLocalization.getString("pe.verbChangePage"); },
            enumerable: true,
            configurable: true
        });
        SurveyVerbChangePageItem.prototype.changePage = function (newPage) {
            if (newPage == null || newPage == this.prevPage)
                return;
            this.prevPage.removeQuestion(this.question);
            newPage.addQuestion(this.question);
            if (this.onModifiedCallback)
                this.onModifiedCallback();
        };
        return SurveyVerbChangePageItem;
    }(SurveyVerbItem));
    SurveyEditor.SurveyVerbChangePageItem = SurveyVerbChangePageItem;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyUndoRedo = (function () {
        function SurveyUndoRedo() {
            this.index = -1;
            this.maximumCount = 10;
            this.items = [];
            this.koCanUndo = ko.observable(false);
            this.koCanRedo = ko.observable(false);
        }
        SurveyUndoRedo.prototype.clear = function () {
            this.items = [];
            this.koCanUndo(false);
            this.koCanRedo(false);
        };
        SurveyUndoRedo.prototype.setCurrent = function (survey, selectedObjName) {
            var item = new UndoRedoItem();
            item.surveyJSON = new Survey.JsonObject().toJsonObject(survey);
            item.selectedObjName = selectedObjName;
            if (this.index < this.items.length - 1) {
                this.items.splice(this.index + 1);
            }
            this.items.push(item);
            this.removeOldData();
            this.index = this.items.length - 1;
            this.updateCanUndoRedo();
        };
        SurveyUndoRedo.prototype.undo = function () {
            if (!this.canUndo)
                return null;
            return this.doUndoRedo(-1);
        };
        SurveyUndoRedo.prototype.redo = function () {
            if (!this.canRedo)
                return null;
            return this.doUndoRedo(1);
        };
        SurveyUndoRedo.prototype.updateCanUndoRedo = function () {
            this.koCanUndo(this.canUndo);
            this.koCanRedo(this.canRedo);
        };
        SurveyUndoRedo.prototype.doUndoRedo = function (dIndex) {
            this.index += dIndex;
            this.updateCanUndoRedo();
            return this.index >= 0 && this.index < this.items.length ? this.items[this.index] : null;
        };
        Object.defineProperty(SurveyUndoRedo.prototype, "canUndo", {
            get: function () {
                return this.index >= 1 && this.index < this.items.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyUndoRedo.prototype, "canRedo", {
            get: function () {
                return this.items.length > 1 && this.index < this.items.length - 1;
            },
            enumerable: true,
            configurable: true
        });
        SurveyUndoRedo.prototype.removeOldData = function () {
            if (this.items.length - 1 < this.maximumCount)
                return;
            this.items.splice(0, this.items.length - this.maximumCount - 1);
        };
        return SurveyUndoRedo;
    }());
    SurveyEditor.SurveyUndoRedo = SurveyUndoRedo;
    var UndoRedoItem = (function () {
        function UndoRedoItem() {
        }
        return UndoRedoItem;
    }());
    SurveyEditor.UndoRedoItem = UndoRedoItem;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var templateEditor;
(function (templateEditor) {
    var ko;
    (function (ko) {
        ko.html = '<div class="row nav-tabs">    <nav class="navbar-default">        <div class="container-fluid">            <div class="collapse navbar-collapse">                <ul class="nav nav-tabs no-borders">                    <li data-bind="css: {active: koViewType() == \'actions\'}"><a href="#" data-bind="click:selectAction">Select Action</a></li>                    <li data-bind="css: {active: koViewType() == \'designer\'}"><a href="#" data-bind="click:selectDesignerClick, text: $root.getLocString(\'ed.designer\')"></a></li>                    <!-- <li data-bind="css: {active: koViewType() == \'test\'}"><a href="#" data-bind=""></a></li> -->                    <li data-bind="visible: koShowSaveButton"><button type="button" class="btn btn-default" data-bind="click: saveButtonClick"><span data-bind="text: $root.getLocString(\'ed.saveSurvey\')"></span></button></li>                    <li data-bind="visible: koViewType() == \'test\'" style="margin-left:5px">                        <select style="margin-top: 10px" data-bind="value: koTestSurveyWidth">                            <option value="100%" data-bind="text: $root.getLocString(\'ed.testSurveyWidth\') + \'100%\'"></option>                            <option value="1200px" data-bind="text: $root.getLocString(\'ed.testSurveyWidth\') + \'1200px\'"></option>                            <option value="1000px" data-bind="text: $root.getLocString(\'ed.testSurveyWidth\') + \'1000px\'"></option>                            <option value="800px" data-bind="text: $root.getLocString(\'ed.testSurveyWidth\') + \'800px\'"></option>                            <option value="600px" data-bind="text: $root.getLocString(\'ed.testSurveyWidth\') + \'600px\'"></option>                            <option value="400px" data-bind="text: $root.getLocString(\'ed.testSurveyWidth\') + \'400px\'"></option>                        </select>                    </li>                </ul>                </div>        </div>    </nav> </div><div class="panel" style="width:100%">    <div data-bind="visible: koViewType() == \'actions\'">        <div data-bind="template: { name: \'actions\'  }"></div>    </div>    <div id="surveyjsEditor" data-bind="visible: koViewType() == \'editor\'" style="height:450px;width:100%"></div>    <div id="surveyjsTest" data-bind="visible: koViewType() == \'test\', style: {width: koTestSurveyWidth}" style="margin: 10px">        <div id="surveyjsExample"></div>        <div id="surveyjsExampleResults"></div>        <button id="surveyjsExamplereRun" data-bind="click:selectTestClick, text: $root.getLocString(\'ed.testSurveyAgain\')" style="display:none">Test Again</button>    </div>    <div id="surveyjsEmbed" data-bind="visible: koViewType() == \'embed\'" style="margin: 10px">        <div data-bind="template: { name: \'surveyembeding\', data: surveyEmbeding }"></div>    </div>    <div class="row"  data-bind="visible: koViewType() == \'designer\'">        <div class="row col-md-9">            <div class="col-md-3">                <div class="panel panel-default" style="width:100%">                    <div class="panel-heading">                        <b data-bind="text: $root.getLocString(\'ed.toolbox\')"></b>                    </div>                    <div class="btn-group-vertical" style="width:100%;padding-right:2px">                        <!-- ko foreach: questionTypes -->                        <div class="btn btn-default" style="text-align:left; padding-left:10px; margin:1px;width:100%" draggable="true" data-bind="click: $parent.clickQuestion, event:{dragstart: function(el, e) { $parent.draggingQuestion($data, e); return true;}}">                            <span data-bind="text: $root.getLocString(\'qt.\' + $data)"></span>                        </div>                        <!-- /ko  -->                        <!-- ko foreach: koCopiedQuestions -->                        <div class="btn btn-primary" style="text-align:left; padding-left:10px; margin:1px;width:100%" draggable="true" data-bind="click: $parent.clickCopiedQuestion, event:{dragstart: function(el, e) { $parent.draggingCopiedQuestion($data, e); return true;}}">                            <span data-bind="text:name"></span>                        </div>                        <!-- /ko  -->                    </div>                </div>            </div>            <div class="col-md-9">                <div data-bind="template: { name: \'pageeditor\', data: pagesEditor }"></div>                <div style="overflow-y: scroll;height:450px;">                    <div id="surveyjs" style="width:100%"></div>                </div>                <button id="save" class="btn btn-primary" data-bind="click:saveSurveyClick">Save Survey!</button>                <button id="test-survey" class="btn btn-primary" data-bind="click:selectTestClick, text: $root.getLocString(\'ed.testSurvey\')"></button>            </div>        </div>        <div class="col-md-3">            <div class="panel panel-default" style="width:100%">                <div class="panel-heading">                    <div class="input-group">                        <select class="form-control" data-bind="options: koObjects, optionsText: \'text\', value: koSelectedObject"></select>                        <span class="input-group-btn">                            <button class="btn btn-default" type="button" data-bind="enable: koCanDeleteObject, click: deleteCurrentObject, attr: { title: $root.getLocString(\'ed.delSelObject\')}"><span class="glyphicon glyphicon-remove"></span></button>                        </span>                    </div>                </div>                <div data-bind="template: { name: \'objecteditor\', data: selectedObjectEditor }"></div>                <div class="panel-footer" data-bind="visible:surveyVerbs.koHasVerbs">                    <div data-bind="template: { name: \'objectverbs\', data: surveyVerbs }"></div>                </div>            </div>        </div>    </div></div><script type="text/html" id="objecteditor">    <table class="table svd_table-nowrap">        <tbody data-bind="foreach: koProperties">            <tr data-bind="click: $parent.changeActiveProperty($data), css: {\'active\': $parent.koActiveProperty() == $data}">                <td data-bind="text: displayName, attr: {title: title}" width="50%"></td>                <td width="50%">                    <span data-bind="text: koText, visible: $parent.koActiveProperty() != $data, attr: {title: koText}, style: {color: koIsDefault() ? \'gray\' : \'\'}" style="text-overflow:ellipsis;white-space:nowrap;overflow:hidden"></span>                    <div data-bind="visible: $parent.koActiveProperty() == $data">                        <!-- ko template: { name: \'propertyeditor-\' + editorType, data: $data } -->                        <!-- /ko -->                    </div>                </td>            </tr>        </tbody>    </table></script><script type="text/html" id="objectverbs">    <!-- ko foreach: koVerbs -->        <div class="row">            <div class="input-group">                <span  class="input-group-addon" data-bind="text:text"></span>                <select class="form-control" data-bind="options: koItems, optionsText: \'text\', optionsValue:\'value\', value: koSelectedItem"></select>            </div>        </div>    <!-- /ko  --></script><script type="text/html" id="pageeditor">    <ul class="nav nav-tabs" data-bind="tabs:true">        <!-- ko foreach: koPages -->        <li data-bind="css: {active: koSelected()},event:{           keydown:function(el, e){ $parent.keyDown(el, e); },           dragstart:function(el, e){ $parent.dragStart(el); return true; },           dragover:function(el, e){ $parent.dragOver(el);},           dragend:function(el, e){ $parent.dragEnd();},           drop:function(el, e){ $parent.dragDrop(el);}         }">             <a href="#" data-bind="click:$parent.selectPageClick">                <span data-bind="text: title"></span>            </a>        </li>        <!-- /ko  -->        <li><button type="button" class="btn btn-default" data-bind="click:addNewPageClick"><span class="glyphicon glyphicon-plus"></span></button></li>    </ul></script><script type="text/html" id="actions">    <div class="panel" style="width:100%">        <div class="container">            <div class="row">                <div class="col-sm-12">                    <div id="surveies" class="form-group col-sm-8">                        <label for="old-surveies">Select Survey</label>                        <!-- <select class="form-control" id="old-surveies" name="old-surveies"></select> -->                        <!-- <pre data-bind="text: JSON.stringify(ko.toJS(availableSurveies))"></pre> -->                        <!--  -->                        <select id="surveies" class="form-control" data-bind="                         options: availableSurveies,                        optionsValue: \'id\',                        optionsText: \'text\'"></select>                    </div>                    <div>                        <div><label>Operations</label></div>                        <!-- selectDesignerClick -->                        <button alt="Add new survey" type="button" class="btn btn-primary" data-bind="click: addNewSurvey"><span class="glyphicon glyphicon-plus"></span>Add survey</button>                        <button id="" type="button" class="btn btn-success " data-bind="event: { click: availableSurveySelect }">Edit survey</button>                        <button id="remove" type="button" class="btn btn-danger " data-bind="event: { click: removeSurveyClick }"><span class="glyphicon glyphicon-minus"></span>Remove survey</button>                    </div>                </div>            </div>        </div>    </div></script><script type="text/html" id="surveyembeding">    <div class="row">        <select data-bind="value:koLibraryVersion">            <option value="knockout" data-bind="text: $root.getLocString(\'ew.knockout\')"></option>            <option value="react" data-bind="text: $root.getLocString(\'ew.react\')"></option>        </select>        <select data-bind="value:koScriptUsing">            <option value="bootstrap" data-bind="text: $root.getLocString(\'ew.bootstrap\')"></option>            <option value="standard" data-bind="text: $root.getLocString(\'ew.standard\')"></option>        </select>        <select data-bind="value:koShowAsWindow">            <option value="page" data-bind="text: $root.getLocString(\'ew.showOnPage\')"></option>            <option value="window" data-bind="text: $root.getLocString(\'ew.showInWindow\')"></option>        </select>        <label class="checkbox-inline" data-bind="visible:koHasIds">            <input type="checkbox" data-bind="checked:koLoadSurvey" />            <span data-bind="text: $root.getLocString(\'ew.loadFromServer\')"></span>        </label>    </div>    <div class="panel">        <div class="panel-heading" data-bind="text: $root.getLocString(\'ew.titleScript\')"></div>        <div id="surveyEmbedingHead" style="height:70px;width:100%"></div>    </div>    <div class="panel" data-bind="visible: koVisibleHtml">        <div class="panel-heading"  data-bind="text: $root.getLocString(\'ew.titleHtml\')"></div>        <div id="surveyEmbedingBody" style="height:30px;width:100%"></div>    </div>    <div class="panel">        <div class="panel-heading"  data-bind="text: $root.getLocString(\'ew.titleJavaScript\')"></div>        <div id="surveyEmbedingJava" style="height:300px;width:100%"></div>    </div></script><script type="text/html" id="propertyeditor-boolean">    <input type="checkbox" data-bind="checked: koValue" /></script><script type="text/html" id="propertyeditor-dropdown">    <select data-bind="value: koValue, options: choices"  style="width:100%"></select></script><script type="text/html" id="propertyeditor-html">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-html">    <textarea data-bind="value:koValue" style="width:100%" rows="10" autofocus="autofocus"></textarea></script><script type="text/html" id="propertyeditor-itemvalues">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-itemvalues">    <div style="overflow-y: auto; overflow-x:hidden; max-height:400px">        <table class="table">            <thead>                <tr>                    <th data-bind="text: $root.getLocString(\'pe.value\')"></th>                    <th data-bind="text: $root.getLocString(\'pe.text\')"></th>                    <th></th>                </tr>            </thead>            <tbody>                <!-- ko foreach: koItems -->                <tr>                    <td>                        <input type="text" class="form-control" data-bind="value:koValue" style="width:200px" />                        <div class="alert alert-danger no-padding" role="alert" data-bind="visible:koHasError, text: $root.getLocString(\'pe.enterNewValue\')"></div>                    </td>                    <td><input type="text" class="form-control" data-bind="value:koText" style="width:200px" /></td>                    <td><input type="button" class="btn" data-bind="click: $parent.onDeleteClick, value: $root.getLocString(\'pe.delete\')" /></td>                </tr>                <!-- /ko -->            </tbody>        </table>    </div>    <div class="row btn-toolbar">        <input type="button" class="btn btn-success" data-bind="click: onAddClick, value: $root.getLocString(\'pe.addNew\')" />        <input type="button" class="btn btn-danger" data-bind="click: onClearClick, value: $root.getLocString(\'pe.removeAll\')" />    </div></script><script type="text/html" id="propertyeditor-matrixdropdowncolumns">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-matrixdropdowncolumns">    <table class="table">        <thead>            <tr>                <th data-bind="text: $root.getLocString(\'pe.required\')"></th>                <th data-bind="text: $root.getLocString(\'pe.cellType\')"></th>                <th data-bind="text: $root.getLocString(\'pe.name\')"></th>                <th data-bind="text: $root.getLocString(\'pe.title\')"></th>                <th></th>            </tr>        </thead>        <tbody>            <!-- ko foreach: koItems -->            <tr>                <td>                    <a href="#" data-bind="visible:koHasChoices, click: onShowChoicesClick">                        <span class="glyphicon" data-bind="css: {\'glyphicon-chevron-down\': !koShowChoices(), \'glyphicon-chevron-up\': koShowChoices()}"></span>                    </a>                    <input type="checkbox" data-bind="checked: koIsRequired" />                </td>                <td>                    <select class="form-control" data-bind="options: cellTypeChoices, value: koCellType"  style="width:110px"></select>                </td>                <td>                    <input type="text" class="form-control" data-bind="value:koName" style="width:100px" />                    <div class="alert alert-danger no-padding" role="alert" data-bind="visible:koHasError, text: $root.getLocString(\'pe.enterNewValue\')"></div>                </td>                <td><input type="text" class="form-control" data-bind="value:koTitle" style="width:120px" /></td>                <td><input type="button" class="btn" data-bind="click: $parent.onDeleteClick, value: $root.getLocString(\'pe.delete\')"/></td>            </tr>            <tr data-bind="visible: koShowChoices() && koHasChoices()">                <td colspan="4" style="border-top-style:none">                    <div class="form-group">                        <label class="control-label col-sm-3" data-bind="text:$root.getLocString(\'pe.hasOther\')"></label>                        <div class="col-sm-2">                            <input type="checkbox" data-bind="checked: koHasOther" />                        </div>                        <div class="col-sm-7" data-bind="visible: !koHasColCount()"></div>                        <label class="control-label col-sm-3" data-bind="visible:koHasColCount, text:$root.getLocString(\'pe.colCount\')"></label>                        <select class="form-control col-sm-4" data-bind="visible:koHasColCount, options: colCountChoices, value: koColCount" style="width:110px"></select>                    </div>                    <div class="modal-body svd_notopbottompaddings">                        <!-- ko template: { name: \'propertyeditorcontent-itemvalues\', data: choicesEditor } -->                        <!-- /ko -->                    </div>                </td>            </tr>            <!-- /ko -->            <tr>                <td colspan="3">                    <div class="row btn-toolbar">                        <input type="button" class="btn btn-success" data-bind="click: onAddClick, value: $root.getLocString(\'pe.addNew\')"/>                        <input type="button" class="btn btn-danger" data-bind="click: onClearClick, value: $root.getLocString(\'pe.removeAll\')"" />                    </div>                </td>            </tr>        </tbody>    </table></script><script type="text/html" id="propertyeditor-modal">    <div data-bind="visible:!editor.isEditable">        <span data-bind="text: koText"></span>        <button type="button"  class="btn btn-default"data-toggle="modal" style="padding: 2px;" data-bind="attr: {\'data-target\' : modalNameTarget}">            <span class="glyphicon glyphicon-edit" aria-hidden="true"></span>        </button>    </div>    <div data-bind="visible:editor.isEditable" style="display:table">        <input type="text" data-bind="value: koValue" style="display:table-cell; width:100%" />        <button type="button" class="btn btn-default" style="display:table-cell; padding: 2px;"  data-toggle="modal" data-bind="attr: {\'data-target\' : modalNameTarget}">            <span class="glyphicon glyphicon-edit" aria-hidden="true"></span>        </button>    </div>    <div data-bind="attr: {id : modalName}" class="modal fade" role="dialog">        <div class="modal-dialog">            <div class="modal-content">                <div class="modal-header">                    <button type="button" class="close" data-dismiss="modal">&times;</button>                    <h4 class="modal-title" data-bind="text:editor.title"></h4>                </div>                  <div class="modal-body svd_notopbottompaddings">                    <!-- ko template: { name: \'propertyeditorcontent-\' + editorType, data: editor } -->                    <!-- /ko -->                </div>                <div class="modal-footer">                    <input type="button" class="btn btn-primary" data-bind="click: editor.onApplyClick, value: $root.getLocString(\'pe.apply\')" style="width:100px" />                    <input type="button" class="btn btn-default" data-bind="click: editor.onResetClick, value: $root.getLocString(\'pe.reset\')" style="width:100px" />                    <input type="button" class="btn btn-default" data-dismiss="modal" data-bind="value: $root.getLocString(\'pe.close\')" style="width:100px" />                </div>            </div>        </div>    </div></script><script type="text/html" id="propertyeditor-number">    <input type="number" data-bind="value: koValue" style="width:100%" /></script><script type="text/html" id="propertyeditor-restfull">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-restfull">    <form>        <div class="form-group">            <label for="url">Url:</label>            <input id="url" type="text" data-bind="value:koUrl" class="form-control" />        </div>        <div class="form-group">            <label for="path">Path:</label>            <input id="path" type="text" data-bind="value:koPath" class="form-control" />        </div>        <div class="form-group">            <label for="valueName">valueName:</label>            <input id="valueName" type="text" data-bind="value:koValueName" class="form-control" />        </div>        <div class="form-group">            <label for="titleName">titleName:</label>            <input id="titleName" type="text" data-bind="value:koTitleName" class="form-control" />        </div>    </form>    <div id="restfullSurvey" style="width:100%;height:150px"></div></script><script type="text/html" id="propertyeditor-string">    <input type="text" data-bind="value: koValue" style="width:100%" /></script><script type="text/html" id="propertyeditor-text">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-text">    <textarea data-bind="value:koValue" style="width:100%" rows="10" autofocus="autofocus"></textarea></script><script type="text/html" id="propertyeditor-textitems">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-textitems"><div class="panel">    <table class="table">        <thead>            <tr>                <th data-bind="text: $root.getLocString(\'pe.name\')"></th>                <th data-bind="text: $root.getLocString(\'pe.title\')"></th>                <th></th>            </tr>        </thead>        <tbody>            <!-- ko foreach: koItems -->            <tr>                <td><input type="text" class="form-control" data-bind="value:koName" style="width:200px" /></td>                <td><input type="text" class="form-control" data-bind="value:koTitle" style="width:200px" /></td>                <td><input type="button" class="btn" data-bind="click: $parent.onDeleteClick, value: $root.getLocString(\'pe.delete\')"/></td>            </tr>            <!-- /ko -->            <tr>                <td colspan="4"><input type="button" class="btn btn-success" data-bind="click: onAddClick, value: $root.getLocString(\'pe.addNew\')"/></td>            </tr>        </tbody>    </table></div></script><script type="text/html" id="propertyeditor-triggers">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-triggers"><div class="panel">    <div class="panel-heading">        <div class="row input-group">            <button type="button" class="dropdown-toggle input-group-addon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">                <span class="glyphicon glyphicon-plus"></span>            </button>            <ul class="dropdown-menu input-group">                <!-- ko foreach: availableTriggers -->                <li><a href="#" data-bind="click: $parent.onAddClick($data)"><span data-bind="text:$data"></span></a></li>                <!-- /ko  -->            </ul>            <select class="form-control" data-bind="options: koItems, optionsText: \'koText\', value: koSelected"></select>            <span class="input-group-btn">                <button type="button" data-bind="enable: koSelected() != null, click: onDeleteClick" class="btn btn-default"><span class="glyphicon glyphicon-remove"></span></button>            </span>        </div>    </div>    <div data-bind="visible: koSelected() == null">        <div data-bind="visible: koQuestions().length == 0, text: $root.getLocString(\'pe.noquestions\')"></div>        <div data-bind="visible: koQuestions().length > 0, text: $root.getLocString(\'pe.createtrigger\')"></div>    </div>    <div data-bind="visible: koSelected() != null">        <div data-bind="with: koSelected">            <div class="row form-inline">                <div class="col-sm-4">                    <span data-bind="text: $root.getLocString(\'pe.triggerOn\')"></span><select class="form-control" data-bind="options:$parent.koQuestions, value: koName"></select> <span> </span>                </div>                <div class="col-sm-4">                    <select class="form-control" data-bind="options:availableOperators, optionsValue: \'name\', optionsText: \'text\', value:koOperator"></select>                </div>                <div class="col-sm-4">                    <input class="form-control" style="padding: 0" type="text" data-bind="visible: koRequireValue, value:koValue" />                </div>            </div>            <!-- ko if: koType() == \'visibletrigger\' -->            <div class="row">                <div class="col-sm-6">                    <!-- ko template: { name: \'propertyeditor-triggersitems\', data: pages } -->                    <!-- /ko -->                </div>                <div class="col-sm-6">                    <!-- ko template: { name: \'propertyeditor-triggersitems\', data: questions } -->                    <!-- /ko -->                </div>            </div>            <!-- /ko -->            <!-- ko if: koType() == \'completetrigger\' -->            <div class="row">               <div style="margin: 10px" data-bind="text: $root.getLocString(\'pe.triggerCompleteText\')"></div>            </div>            <!-- /ko -->            <!-- ko if: koType() == \'setvaluetrigger\' -->            <div class="row form-inline" style="margin-top:10px">                <div class="col-sm-6">                    <span data-bind="text: $root.getLocString(\'pe.triggerSetToName\')"></span><input class="form-control" type="text" data-bind="value:kosetToName" />                </div>                <div class="col-sm-1">                </div>                <div class="col-sm-5">                    <span data-bind="text: $root.getLocString(\'pe.triggerSetValue\')"></span><input class="form-control" type="text" data-bind="value:kosetValue" />                </div>            </div>            <div class="row form-inline">                <div class="col-sm-12">                    <input type="checkbox" data-bind="checked: koisVariable" /> <span data-bind="text: $root.getLocString(\'pe.triggerIsVariable\')"></span>                </div>            </div>            <!-- /ko -->        </div>    </div></div></script><script type="text/html" id="propertyeditor-triggersitems">    <div class="panel no-margins no-padding">        <div class="panel-heading">            <span data-bind="text: title"></span>        </div>        <div class="input-group">            <select class="form-control" multiple="multiple" data-bind="options:koChoosen, value: koChoosenSelected"></select>            <span class="input-group-btn" style="vertical-align:top">                <button type="button" data-bind="enable: koChoosenSelected() != null, click: onDeleteClick" class="btn"><span class="glyphicon glyphicon-remove"></span></button>            </span>        </div>        <div class="input-group" style="margin-top:5px">            <select class="form-control" data-bind="options:koObjects, value: koSelected"></select>            <span class="input-group-btn">                <button type="button" data-bind="enable: koSelected() != null, click: onAddClick" style="width:40px" class="btn btn-success"><span class="glyphicon glyphicon-plus"></span></button>            </span>        </div>    </div></script><script type="text/html" id="propertyeditor-validators">    <!-- ko template: { name: \'propertyeditor-modal\', data: $data } --><!-- /ko --></script><script type="text/html" id="propertyeditorcontent-validators"><div class="panel">    <div class="panel-heading">        <div class="row input-group">            <button type="button" class="dropdown-toggle input-group-addon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">                <span class="glyphicon glyphicon-plus"></span>            </button>            <ul class="dropdown-menu input-group">                <!-- ko foreach: availableValidators -->                <li><a href="#" data-bind="click: $parent.onAddClick($data)"><span data-bind="text:$data"></span></a></li>                <!-- /ko  -->            </ul>            <select class="form-control" data-bind="options: koItems, optionsText: \'text\', value: koSelected"></select>            <span class="input-group-btn">                <button type="button" data-bind="enable: koSelected() != null, click: onDeleteClick" class="btn"><span class="glyphicon glyphicon-remove"></span></button>            </span>        </div>    </div>    <div data-bind="template: { name: \'objecteditor\', data: selectedObjectEditor }"></div></div></script>';
    })(ko = templateEditor.ko || (templateEditor.ko = {}));
})(templateEditor || (templateEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var template_page;
(function (template_page) {
    template_page.html = '<div data-bind="event:{           dragenter:function(el, e){ dragEnter(e);},           dragleave:function(el, e){ dragLeave(e);},           dragover:function(el, e){ return false;},           drop:function(el, e){ dragDrop(e);}}     ">    <h4 data-bind="visible: (title.length > 0) && data.showPageTitles, text: koNo() + processedTitle, css: $root.css.pageTitle"></h4>    <!-- ko foreach: { data: rows, as: \'row\'} -->    <div data-bind="visible: row.koVisible, css: $root.css.row">        <!-- ko foreach: { data: row.questions, as: \'question\' , afterRender: row.koAfterRender } -->        <!-- ko template: { name: \'survey-question\', data: question } -->        <!-- /ko -->        <!-- /ko -->    </div>    <!-- /ko -->    <div class="well" data-bind="visible:$root.isDesignMode && questions.length == 0">        <span data-bind="text:$root.getEditorLocString(\'survey.dropQuestion\')"></span>    </div>    <div class="svd_dragover" data-bind="visible: koDraggingBottom"></div></div>';
})(template_page || (template_page = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var template_question;
(function (template_question) {
    template_question.html = '<div style="vertical-align:top" data-bind="style: {display: question.koVisible()|| $root.isDesignMode ? \'inline-block\': \'none\', marginLeft: question.koMarginLeft, paddingRight: question.koPaddingRight, width: question.koRenderWidth },      attr : {id: id, draggable: $root.isDesignMode}, click: $root.isDesignMode ? koOnClick: null,          event:{           dragstart:function(el, e){ dragStart(e); return true; },           dragover:function(el, e){ dragOver(e);},           drop:function(el, e){ dragDrop(e);}         }, css:{svd_q_design_border: $root.isDesignMode, svd_q_selected : koIsSelected, \'well well-sm\': $root.isDesignMode}">    <div style="vertical-align:top" class="svd_dragover" data-bind="visible: koIsDragging"></div>    <div class="svd_q_copybutton" data-bind="visible: koIsSelected">        <button class="btn btn-primary btn-xs" data-bind="click: $root.copyQuestionClick, text:$root.getEditorLocString(\'survey.copy\')"></button>    </div>    <div data-bind="css:{svd_q_design: $root.isDesignMode}">        <div class="alert alert-danger" role="alert" data-bind="visible: koErrors().length > 0, foreach: koErrors">            <div>                <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>                <span data-bind="text:$data.getText()"></span>            </div>        </div>        <!-- ko if: question.hasTitle -->        <h5 data-bind="visible: $root.questionTitleLocation == \'top\', text: question.koTitle(), css: $root.css.question.title"></h5>        <!-- /ko -->        <!-- ko template: { name: \'survey-question-\' + question.getType(), data: question } -->        <!-- /ko -->        <div data-bind="visible: question.hasComment">            <div data-bind="text:question.commentText"></div>            <div data-bind="template: { name: \'survey-comment\', data: {\'question\': question, \'visible\': true } }"></div>        </div>        <!-- ko if: question.hasTitle -->        <h5 data-bind="visible: $root.questionTitleLocation == \'bottom\', text: question.koTitle(), css: $root.css.question.title"></h5>        <!-- /ko -->    </div></div>';
})(template_question || (template_question = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
/// <reference path="objectEditor.ts" />
/// <reference path="pagesEditor.ts" />
/// <reference path="textWorker.ts" />
/// <reference path="surveyHelper.ts" />
/// <reference path="surveyEmbedingWindow.ts" />
/// <reference path="objectVerbs.ts" />
/// <reference path="dragdrophelper.ts" />
/// <reference path="undoredo.ts" />
/// <reference path="templateEditor.ko.html.ts" />
/// <reference path="template_page.html.ts" />
/// <reference path="template_question.html.ts" />
/// <reference path="../typings/globals/jquery/index.d.ts" />
/// <reference path="../typings/globals/bootstrap-notify/index.d.ts" />
var SurveyEditor;
(function (SurveyEditor_1) {
    var SurveyEditor = (function () {
        function SurveyEditor(renderedElement, options) {
            if (renderedElement === void 0) { renderedElement = null; }
            if (options === void 0) { options = null; }
            this.stateValue = "";
            this.surveyId = null;
            this.surveyPostId = null;
            this.alwaySaveTextInPropertyEditors = false;
            this.saveNo = 0;
            this.timeoutId = -1;
            this.options = options;
            this.questionTypes = this.getQuestionTypes();
            this.koCopiedQuestions = ko.observableArray();
            this.koCanDeleteObject = ko.observable(false);
            var self = this;
            this.koState = ko.observable();
            this.koShowSaveButton = ko.observable(false);
            this.koShowOptions = ko.observable(false);
            this.koTestSurveyWidth = ko.observable("100%");
            this.saveButtonClick = function () { self.doSave(); };
            this.koObjects = ko.observableArray();
            this.availableSurveies = self.availableSurveiesOptionsList;
            this.koSelectedObject = ko.observable();
            this.koSelectedObject.subscribe(function (newValue) { self.selectedObjectChanged(newValue != null ? newValue.value : null); });
            this.koGenerateValidJSON = ko.observable(this.options && this.options.generateValidJSON);
            this.koGenerateValidJSON.subscribe(function (newValue) {
                if (!self.options)
                    self.options = {};
                self.options.generateValidJSON = newValue;
                if (self.generateValidJSONChangedCallback)
                    self.generateValidJSONChangedCallback(newValue);
            });
            this.surveyObjects = new SurveyEditor_1.SurveyObjects(this.koObjects, this.koSelectedObject);
            this.undoRedo = new SurveyEditor_1.SurveyUndoRedo();
            this.surveyVerbs = new SurveyEditor_1.SurveyVerbs(function () { self.setModified(); });
            this.selectedObjectEditor = new SurveyEditor_1.SurveyObjectEditor(this.options);
            this.selectedObjectEditor.onPropertyValueChanged.add(function (sender, options) {
                self.onPropertyValueChanged(options.property, options.object, options.newValue);
            });
            this.pagesEditor = new SurveyEditor_1.SurveyPagesEditor(function () { self.addPage(); }, function (page) { self.surveyObjects.selectObject(page); }, function (indexFrom, indexTo) { self.movePage(indexFrom, indexTo); }, function (page) { self.deleteCurrentObject(); });
            this.surveyEmbeding = new SurveyEditor_1.SurveyEmbedingWindow();
            this.koViewType = ko.observable("action");
            this.koIsShowDesigner = ko.computed(function () { return self.koViewType() == "designer"; });
            this.selectAction = function () { self.showActions(); };
            this.selectDesignerClick = function () { self.showDesigner(); };
            this.addNewSurveyClick = function () { self.addNewSurvey(); };
            this.removeSurveyClick = function () { self.removeSurvey(); };
            this.saveSurveyClick = function () { self.saveSurvey(); };
            this.selectEditorClick = function () { self.showJsonEditor(); };
            this.selectTestClick = function () { self.showTestSurvey(); };
            this.selectEmbedClick = function () { self.showEmbedEditor(); };
            this.generateValidJSONClick = function () { self.koGenerateValidJSON(true); };
            this.generateReadableJSONClick = function () { self.koGenerateValidJSON(false); };
            this.runSurveyClick = function () { self.showLiveSurvey(); };
            this.embedingSurveyClick = function () { self.showSurveyEmbeding(); };
            this.deleteObjectClick = function () { self.deleteCurrentObject(); };
            this.draggingQuestion = function (questionType, e) { self.doDraggingQuestion(questionType, e); };
            this.clickQuestion = function (questionType) { self.doClickQuestion(questionType); };
            this.draggingCopiedQuestion = function (item, e) { self.doDraggingCopiedQuestion(item.json, e); };
            this.clickCopiedQuestion = function (item) { self.doClickCopiedQuestion(item.json); };
            this.doUndoClick = function () { self.doUndoRedo(self.undoRedo.undo()); };
            this.doRedoClick = function () { self.doUndoRedo(self.undoRedo.redo()); };
            if (renderedElement) {
                this.render(renderedElement);
            }
        }
        Object.defineProperty(SurveyEditor.prototype, "survey", {
            get: function () {
                return this.surveyValue;
            },
            enumerable: true,
            configurable: true
        });
        SurveyEditor.prototype.render = function (element) {
            if (element === void 0) { element = null; }
            var self = this;
            if (element && typeof element == "string") {
                element = document.getElementById(element);
            }
            if (element) {
                this.renderedElement = element;
            }
            element = this.renderedElement;
            if (!element)
                return;
            element.innerHTML = templateEditor.ko.html;
            self.applyBinding();
        };
        SurveyEditor.prototype.loadSurvey = function (surveyId) {
            var self = this;
            new Survey.dxSurveyService().loadSurvey(surveyId, function (success, result, response) {
                if (success && result) {
                    self.text = JSON.stringify(result);
                }
            });
        };
        Object.defineProperty(SurveyEditor.prototype, "text", {
            get: function () {
                if (this.koIsShowDesigner())
                    return this.getSurveyTextFromDesigner();
                return this.jsonEditor != null ? this.jsonEditor.getValue() : "";
            },
            set: function (value) {
                this.textWorker = new SurveyEditor_1.SurveyTextWorker(value);
                if (this.textWorker.isJsonCorrect) {
                    this.initSurvey(new Survey.JsonObject().toJsonObject(this.textWorker.survey));
                    this.showDesigner();
                    this.setUndoRedoCurrentState(true);
                }
                else {
                    this.setTextValue(value);
                    this.koViewType("editor");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyEditor.prototype, "availableSurveiesOptionsList", {
            get: function () {
                var surveies = new Array;
                surveies.push({ text: '-Select Survey' });
                jQuery.ajax({
                    url: "http://localhost:3000/get-surveies",
                    type: "get",
                    async: false,
                    success: function (data) {
                        var i = 1;
                        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                            obj = data_1[_i];
                            surveies.push({
                                id: obj._id,
                                text: "Survey " + i,
                            });
                            i++;
                        }
                    }
                });
                return surveies;
            },
            enumerable: true,
            configurable: true
        });
        SurveyEditor.prototype.setAvailableSurveiesOptionsList = function (value) {
            this.availableSurveiesOptionsList = value;
        };
        Object.defineProperty(SurveyEditor.prototype, "state", {
            get: function () { return this.stateValue; },
            enumerable: true,
            configurable: true
        });
        SurveyEditor.prototype.setState = function (value) {
            this.stateValue = value;
            this.koState(this.state);
        };
        SurveyEditor.prototype.doSave = function () {
            this.setState("saving");
            if (this.saveSurveyFunc) {
                this.saveNo++;
                var self = this;
                this.saveSurveyFunc(this.saveNo, function doSaveCallback(no, isSuccess) {
                    self.setState("saved");
                    if (self.saveNo == no) {
                        if (isSuccess)
                            self.setState("saved");
                    }
                });
            }
        };
        SurveyEditor.prototype.setModified = function () {
            this.setState("modified");
            this.setUndoRedoCurrentState();
        };
        SurveyEditor.prototype.setUndoRedoCurrentState = function (clearState) {
            if (clearState === void 0) { clearState = false; }
            if (clearState) {
                this.undoRedo.clear();
            }
            var selObj = this.koSelectedObject() ? this.koSelectedObject().value : null;
            this.undoRedo.setCurrent(this.surveyValue, selObj ? selObj.name : null);
        };
        Object.defineProperty(SurveyEditor.prototype, "saveSurveyFunc", {
            get: function () { return this.saveSurveyFuncValue; },
            set: function (value) {
                this.saveSurveyFuncValue = value;
                this.koShowSaveButton(value != null);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyEditor.prototype, "showOptions", {
            get: function () { return this.koShowOptions(); },
            set: function (value) { this.koShowOptions(value); },
            enumerable: true,
            configurable: true
        });
        SurveyEditor.prototype.setTextValue = function (value) {
            this.isProcessingImmediately = true;
            if (this.jsonEditor) {
                this.jsonEditor.setValue(value);
                this.jsonEditor.renderer.updateFull(true);
            }
            this.processJson(value);
            this.isProcessingImmediately = false;
        };
        SurveyEditor.prototype.addPage = function () {
            var name = SurveyEditor_1.SurveyHelper.getNewPageName(this.survey.pages);
            var page = this.surveyValue.addNewPage(name);
            this.addPageToUI(page);
            this.setModified();
        };
        SurveyEditor.prototype.getLocString = function (str) { return SurveyEditor_1.editorLocalization.getString(str); };
        SurveyEditor.prototype.getQuestionTypes = function () {
            var allTypes = Survey.QuestionFactory.Instance.getAllTypes();
            if (!this.options || !this.options.questionTypes || !this.options.questionTypes.length)
                return allTypes;
            var result = [];
            for (var i = 0; i < this.options.questionTypes.length; i++) {
                var questionType = this.options.questionTypes[i];
                if (allTypes.indexOf(questionType) > -1) {
                    result.push(questionType);
                }
            }
            return result;
        };
        SurveyEditor.prototype.movePage = function (indexFrom, indexTo) {
            var page = this.survey.pages[indexFrom];
            this.survey.pages.splice(indexFrom, 1);
            this.survey.pages.splice(indexTo, 0, page);
            this.pagesEditor.survey = this.survey;
            this.surveyObjects.selectObject(page);
            this.setModified();
        };
        SurveyEditor.prototype.addPageToUI = function (page) {
            this.pagesEditor.survey = this.surveyValue;
            this.surveyObjects.addPage(page);
        };
        SurveyEditor.prototype.onQuestionAdded = function (question) {
            var page = this.survey.getPageByQuestion(question);
            this.surveyObjects.addQuestion(page, question);
            this.survey.render();
        };
        SurveyEditor.prototype.onQuestionRemoved = function (question) {
            this.surveyObjects.removeObject(question);
            this.survey.render();
        };
        SurveyEditor.prototype.onPropertyValueChanged = function (property, obj, newValue) {
            var isDefault = property.isDefaultValue(newValue);
            obj[property.name] = newValue;
            if (property.name == "name") {
                this.surveyObjects.nameChanged(obj);
                if (SurveyEditor_1.SurveyHelper.getObjectType(obj) == SurveyEditor_1.ObjType.Page) {
                    this.pagesEditor.changeName(obj);
                }
            }
            this.setModified();
            this.survey.render();
        };
        SurveyEditor.prototype.doUndoRedo = function (item) {
            this.initSurvey(item.surveyJSON);
            if (item.selectedObjName) {
                var selObj = this.findObjByName(item.selectedObjName);
                if (selObj) {
                    this.surveyObjects.selectObject(selObj);
                }
            }
            this.setState(this.undoRedo.koCanUndo() ? "modified" : "saved");
        };
        SurveyEditor.prototype.findObjByName = function (name) {
            var page = this.survey.getPageByName(name);
            if (page)
                return page;
            var question = this.survey.getQuestionByName(name);
            if (question)
                return question;
            return null;
        };
        SurveyEditor.prototype.canSwitchViewType = function (newType) {
            if (newType && this.koViewType() == newType)
                return false;
            if (this.koViewType() != "editor" || !this.textWorker)
                return true;
            if (!this.textWorker.isJsonCorrect) {
                alert(this.getLocString("ed.correctJSON"));
                return false;
            }
            this.initSurvey(new Survey.JsonObject().toJsonObject(this.textWorker.survey));
            return true;
        };
        SurveyEditor.prototype.showDesigner = function () {
            if (!this.canSwitchViewType("designer"))
                return;
            this.koViewType("designer");
        };
        SurveyEditor.prototype.addNewSurvey = function () {
            this.text = "{pages: [{name: 'page1'}]}";
            this.surveyId = "";
            this.showDesigner();
        };
        SurveyEditor.prototype.removeSurvey = function (e, element) {
            var self = this;
            $("#remove").toggleClass('disabled');
            var survey = jQuery('#surveies option:selected').val();
            $.ajax({
                url: "http://localhost:3000/remove-survey/" + survey,
                type: 'GET',
                beforeSend: function () {
                    self.notify = jQuery.notify({
                        title: "Removing Survey",
                        message: "<strong>Removing Survey</strong>Do not close this page...",
                        animate: {
                            enter: "animated fadeInDown",
                            exit: "animated fadeOutUp"
                        },
                    });
                },
                success: function (data) {
                    //
                },
                complete: function () {
                    $("#remove").toggleClass('disabled');
                    self.notify.update({
                        title: "Removing Survey",
                        message: "Survey has been removed successfully",
                        animate: {
                            enter: "animated fadeInDown",
                            exit: "animated fadeOutUp"
                        },
                    });
                },
                async: false
            });
        };
        SurveyEditor.prototype.showActions = function () {
            if (!this.canSwitchViewType("actions"))
                return;
            this.koViewType("actions");
        };
        SurveyEditor.prototype.availableSurveySelect = function (e, element) {
            var self = this;
            var survey = jQuery('#surveies option:selected').val();
            if (survey != '') {
                jQuery.ajax({
                    url: "http://localhost:3000/get-survey/" + survey,
                    async: false,
                    method: 'GET',
                    success: function (data) {
                        console.log(data);
                        self.text = data[0].text;
                        self.surveyId = data[0]._id;
                    }
                });
            }
        };
        SurveyEditor.prototype.saveSurvey = function (e, element) {
            jQuery('#save').toggleClass('disabled');
            var self = this;
            var data = {
                survey: this.text
            };
            if (this.surveyId) {
                data.surveyId = this.surveyId;
            }
            jQuery.ajax({
                url: "http://localhost:3000/save-survey",
                type: "POST",
                data: data,
                beforeSend: function () {
                    self.notify = jQuery.notify({
                        title: "Saving Survey",
                        message: "<strong>Saving Survey</strong>Do not close this page...",
                        animate: {
                            enter: "animated fadeInDown",
                            exit: "animated fadeOutUp"
                        },
                    });
                },
                success: function (data) {
                    jQuery('#save').toggleClass('disabled');
                    self.notify.update({
                        title: "Saving Survey",
                        message: "Survey has been saved successfully",
                        animate: {
                            enter: "animated fadeInDown",
                            exit: "animated fadeOutUp"
                        },
                    });
                }
            });
        };
        SurveyEditor.prototype.showJsonEditor = function () {
            if (this.koViewType() == "editor")
                return;
            this.jsonEditor.setValue(this.getSurveyTextFromDesigner());
            this.jsonEditor.focus();
            this.koViewType("editor");
        };
        SurveyEditor.prototype.showTestSurvey = function () {
            if (!this.canSwitchViewType(null))
                return;
            this.showLiveSurvey();
            this.koViewType("test");
        };
        SurveyEditor.prototype.showEmbedEditor = function () {
            if (!this.canSwitchViewType("embed"))
                return;
            this.showSurveyEmbeding();
            this.koViewType("embed");
        };
        SurveyEditor.prototype.getSurveyTextFromDesigner = function () {
            var json = new Survey.JsonObject().toJsonObject(this.survey);
            if (this.options && this.options.generateValidJSON)
                return JSON.stringify(json, null, 1);
            return new SurveyEditor_1.SurveyJSON5().stringify(json, null, 1);
        };
        SurveyEditor.prototype.selectedObjectChanged = function (obj) {
            var canDeleteObject = false;
            this.selectedObjectEditor.selectedObject = obj;
            this.surveyVerbs.obj = obj;
            var objType = SurveyEditor_1.SurveyHelper.getObjectType(obj);
            if (objType == SurveyEditor_1.ObjType.Page) {
                this.survey.currentPage = obj;
                canDeleteObject = this.survey.pages.length > 1;
            }
            if (objType == SurveyEditor_1.ObjType.Question) {
                this.survey["setselectedQuestion"](obj);
                canDeleteObject = true;
                this.survey.currentPage = this.survey.getPageByQuestion(this.survey["selectedQuestionValue"]);
            }
            else {
                this.survey["setselectedQuestion"](null);
            }
            this.koCanDeleteObject(canDeleteObject);
        };
        SurveyEditor.prototype.applyBinding = function () {
            if (this.renderedElement == null)
                return;
            ko.cleanNode(this.renderedElement);
            ko.applyBindings(this, this.renderedElement);
            this.surveyjs = document.getElementById("surveyjs");
            if (this.surveyjs) {
                var self = this;
                this.surveyjs.onkeydown = function (e) {
                    if (!e)
                        return;
                    if (e.keyCode == 46)
                        self.deleteQuestion();
                    if (e.keyCode == 38 || e.keyCode == 40) {
                        self.selectQuestion(e.keyCode == 38);
                    }
                };
            }
            this.jsonEditor = ace.edit("surveyjsEditor");
            this.surveyjsExample = document.getElementById("surveyjsExample");
            this.initSurvey(new SurveyEditor_1.SurveyJSON5().parse(SurveyEditor.defaultNewSurveyText));
            this.setUndoRedoCurrentState(true);
            this.surveyValue.mode = "designer";
            this.surveyValue.render(this.surveyjs);
            this.initJsonEditor();
            SurveyEditor_1.SurveyTextWorker.newLineChar = this.jsonEditor.session.doc.getNewLineCharacter();
        };
        SurveyEditor.prototype.initJsonEditor = function () {
            var self = this;
            this.jsonEditor.setTheme("ace/theme/monokai");
            this.jsonEditor.session.setMode("ace/mode/json");
            this.jsonEditor.setShowPrintMargin(false);
            this.jsonEditor.getSession().on("change", function () {
                self.onJsonEditorChanged();
            });
            this.jsonEditor.getSession().setUseWorker(true);
        };
        SurveyEditor.prototype.initSurvey = function (json) {
            this.surveyValue = new Survey.Survey(json);
            if (this.surveyValue.isEmpty) {
                this.surveyValue = new Survey.Survey(new SurveyEditor_1.SurveyJSON5().parse(SurveyEditor.defaultNewSurveyText));
            }
            this.survey.mode = "designer";
            this.survey.render(this.surveyjs);
            this.surveyObjects.survey = this.survey;
            this.pagesEditor.survey = this.survey;
            this.pagesEditor.setSelectedPage(this.survey.currentPage);
            this.surveyVerbs.survey = this.survey;
            var self = this;
            this.surveyValue["onSelectedQuestionChanged"].add(function (sender, options) { self.surveyObjects.selectObject(sender["selectedQuestionValue"]); });
            this.surveyValue["onCopyQuestion"].add(function (sender, options) { self.copyQuestion(self.koSelectedObject().value); });
            this.surveyValue["onCreateDragDropHelper"] = function () { return self.createDragDropHelper(); };
            this.surveyValue.onProcessHtml.add(function (sender, options) { options.html = self.processHtml(options.html); });
            this.surveyValue.onCurrentPageChanged.add(function (sender, options) { self.pagesEditor.setSelectedPage(sender.currentPage); });
            this.surveyValue.onQuestionAdded.add(function (sender, options) { self.onQuestionAdded(options.question); });
            this.surveyValue.onQuestionRemoved.add(function (sender, options) { self.onQuestionRemoved(options.question); });
        };
        SurveyEditor.prototype.processHtml = function (html) {
            if (!html)
                return html;
            var scriptRegEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            while (scriptRegEx.test(html)) {
                html = html.replace(scriptRegEx, "");
            }
            return html;
        };
        SurveyEditor.prototype.onJsonEditorChanged = function () {
            if (this.timeoutId > -1) {
                clearTimeout(this.timeoutId);
            }
            if (this.isProcessingImmediately) {
                this.timeoutId = -1;
            }
            else {
                var self = this;
                this.timeoutId = setTimeout(function () {
                    self.timeoutId = -1;
                    self.processJson(self.text);
                }, SurveyEditor.updateTextTimeout);
            }
        };
        SurveyEditor.prototype.processJson = function (text) {
            this.textWorker = new SurveyEditor_1.SurveyTextWorker(text);
            if (this.jsonEditor) {
                this.jsonEditor.getSession().setAnnotations(this.createAnnotations(text, this.textWorker.errors));
            }
        };
        SurveyEditor.prototype.doDraggingQuestion = function (questionType, e) {
            this.createDragDropHelper().startDragNewQuestion(e, questionType, this.getNewQuestionName());
        };
        SurveyEditor.prototype.doDraggingCopiedQuestion = function (json, e) {
            this.createDragDropHelper().startDragCopiedQuestion(e, this.getNewQuestionName(), json);
        };
        SurveyEditor.prototype.createDragDropHelper = function () {
            var self = this;
            return new SurveyEditor_1.DragDropHelper(this.survey, function () { self.setModified(); });
        };
        SurveyEditor.prototype.doClickQuestion = function (questionType) {
            this.doClickQuestionCore(Survey.QuestionFactory.Instance.createQuestion(questionType, this.getNewQuestionName()));
        };
        SurveyEditor.prototype.doClickCopiedQuestion = function (json) {
            var name = this.getNewQuestionName();
            var question = Survey.QuestionFactory.Instance.createQuestion(json["type"], name);
            new Survey.JsonObject().toObject(json, question);
            question.name = name;
            this.doClickQuestionCore(question);
        };
        SurveyEditor.prototype.getNewQuestionName = function () {
            return SurveyEditor_1.SurveyHelper.getNewQuestionName(this.survey.getAllQuestions());
        };
        SurveyEditor.prototype.doClickQuestionCore = function (question) {
            var page = this.survey.currentPage;
            var index = -1;
            if (this.survey["selectedQuestionValue"] != null) {
                index = page.questions.indexOf(this.survey["selectedQuestionValue"]) + 1;
            }
            page.addQuestion(question, index);
            this.setModified();
        };
        SurveyEditor.prototype.deleteQuestion = function () {
            var question = this.getSelectedObjAsQuestion();
            if (question) {
                this.deleteCurrentObject();
            }
        };
        SurveyEditor.prototype.selectQuestion = function (isUp) {
            var question = this.getSelectedObjAsQuestion();
            if (question) {
                this.surveyObjects.selectNextQuestion(isUp);
            }
        };
        SurveyEditor.prototype.getSelectedObjAsQuestion = function () {
            var obj = this.koSelectedObject().value;
            if (!obj)
                return null;
            return SurveyEditor_1.SurveyHelper.getObjectType(obj) == SurveyEditor_1.ObjType.Question ? (obj) : null;
        };
        SurveyEditor.prototype.deleteCurrentObject = function () {
            this.deleteObject(this.koSelectedObject().value);
        };
        SurveyEditor.prototype.copyQuestion = function (question) {
            var objType = SurveyEditor_1.SurveyHelper.getObjectType(question);
            if (objType != SurveyEditor_1.ObjType.Question)
                return;
            var json = new Survey.JsonObject().toJsonObject(question);
            json.type = question.getType();
            var item = this.getCopiedQuestionByName(question.name);
            if (item) {
                item.json = json;
            }
            else {
                this.koCopiedQuestions.push({ name: question.name, json: json });
            }
            if (this.koCopiedQuestions().length > 3) {
                this.koCopiedQuestions.splice(0, 1);
            }
        };
        SurveyEditor.prototype.getCopiedQuestionByName = function (name) {
            var items = this.koCopiedQuestions();
            for (var i = 0; i < items.length; i++) {
                if (items[i].name == name)
                    return items[i];
            }
            return null;
        };
        SurveyEditor.prototype.deleteObject = function (obj) {
            this.surveyObjects.removeObject(obj);
            var objType = SurveyEditor_1.SurveyHelper.getObjectType(obj);
            if (objType == SurveyEditor_1.ObjType.Page) {
                this.survey.removePage(obj);
                this.pagesEditor.removePage(obj);
                this.setModified();
            }
            if (objType == SurveyEditor_1.ObjType.Question) {
                this.survey.currentPage.removeQuestion(obj);
                this.survey["setselectedQuestion"](null);
                this.surveyObjects.selectObject(this.survey.currentPage);
                this.setModified();
            }
            this.survey.render();
        };
        SurveyEditor.prototype.showLiveSurvey = function () {
            var _this = this;
            if (!this.surveyjsExample)
                return;
            var json = this.getSurveyJSON();
            if (json != null) {
                if (json.cookieName) {
                    delete json.cookieName;
                }
                var survey = new Survey.Survey(json);
                var self = this;
                var surveyjsExampleResults = document.getElementById("surveyjsExampleResults");
                var surveyjsExamplereRun = document.getElementById("surveyjsExamplereRun");
                if (surveyjsExampleResults)
                    surveyjsExampleResults.innerHTML = "";
                if (surveyjsExamplereRun)
                    surveyjsExamplereRun.style.display = "none";
                survey.onComplete.add(function (sender) { if (surveyjsExampleResults)
                    surveyjsExampleResults.innerHTML = _this.getLocString("ed.surveyResults") + JSON.stringify(survey.data); if (surveyjsExamplereRun)
                    surveyjsExamplereRun.style.display = ""; });
                survey.render(this.surveyjsExample);
            }
            else {
                this.surveyjsExample.innerHTML = this.getLocString("ed.correctJSON");
            }
        };
        SurveyEditor.prototype.showSurveyEmbeding = function () {
            var json = this.getSurveyJSON();
            this.surveyEmbeding.json = json;
            this.surveyEmbeding.surveyId = this.surveyId;
            this.surveyEmbeding.surveyPostId = this.surveyPostId;
            this.surveyEmbeding.generateValidJSON = this.options && this.options.generateValidJSON;
            this.surveyEmbeding.show();
        };
        SurveyEditor.prototype.getSurveyJSON = function () {
            if (this.koIsShowDesigner())
                return new Survey.JsonObject().toJsonObject(this.survey);
            if (this.textWorker.isJsonCorrect)
                return new Survey.JsonObject().toJsonObject(this.textWorker.survey);
            return null;
        };
        SurveyEditor.prototype.createAnnotations = function (text, errors) {
            var annotations = new Array();
            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];
                var annotation = { row: error.position.start.row, column: error.position.start.column, text: error.text, type: "error" };
                annotations.push(annotation);
            }
            return annotations;
        };
        SurveyEditor.updateTextTimeout = 1000;
        SurveyEditor.defaultNewSurveyText = "{ pages: [ { name: 'page1'}] }";
        return SurveyEditor;
    }());
    SurveyEditor_1.SurveyEditor = SurveyEditor;
    new Survey.SurveyTemplateText().replaceText(template_page.html, "page");
    new Survey.SurveyTemplateText().replaceText(template_question.html, "question");
    Survey.Survey.prototype["onCreating"] = function () {
        this.selectedQuestionValue = null;
        this.onSelectedQuestionChanged = new Survey.Event();
        this.onCopyQuestion = new Survey.Event();
        this.onCreateDragDropHelper = null;
        var self = this;
        this.copyQuestionClick = function () { self.onCopyQuestion.fire(self); };
    };
    Survey.Survey.prototype["setselectedQuestion"] = function (value) {
        if (value == this.selectedQuestionValue)
            return;
        var oldValue = this.selectedQuestionValue;
        this.selectedQuestionValue = value;
        if (oldValue != null) {
            oldValue["onSelectedQuestionChanged"]();
        }
        if (this.selectedQuestionValue != null) {
            this.selectedQuestionValue["onSelectedQuestionChanged"]();
        }
        this.onSelectedQuestionChanged.fire(this, { 'oldSelectedQuestion': oldValue, 'newSelectedQuestion': value });
    };
    Survey.Survey.prototype["getEditorLocString"] = function (value) {
        return SurveyEditor_1.editorLocalization.getString(value);
    };
    Survey.Page.prototype["onCreating"] = function () {
        var self = this;
        this.dragEnterCounter = 0;
        this.koDragging = ko.observable(-1);
        this.koDraggingQuestion = ko.observable(null);
        this.koDraggingBottom = ko.observable(false);
        this.koDragging.subscribe(function (newValue) {
            if (newValue < 0) {
                self.dragEnterCounter = 0;
                self.koDraggingQuestion(null);
                self.koDraggingBottom(false);
            }
            else {
                var question = newValue >= 0 && newValue < self.questions.length ? self.questions[newValue] : null;
                self.koDraggingQuestion(question);
                self.koDraggingBottom(question == null);
            }
        });
        this.koDraggingQuestion.subscribe(function (newValue) { if (newValue)
            newValue.koIsDragging(true); });
        this.koDraggingQuestion.subscribe(function (oldValue) { if (oldValue)
            oldValue.koIsDragging(false); }, this, "beforeChange");
        this.dragEnter = function (e) { e.preventDefault(); self.dragEnterCounter++; self.doDragEnter(e); };
        this.dragLeave = function (e) { self.dragEnterCounter--; if (self.dragEnterCounter === 0)
            self.koDragging(-1); };
        this.dragDrop = function (e) { self.doDrop(e); };
    };
    Survey.Page.prototype["doDrop"] = function (e) {
        var dragDropHelper = this.data["onCreateDragDropHelper"] ? this.data["onCreateDragDropHelper"]() : new SurveyEditor_1.DragDropHelper(this.data, null);
        dragDropHelper.doDrop(e);
    };
    Survey.Page.prototype["doDragEnter"] = function (e) {
        if (this.questions.length > 0 || this.koDragging() > 0)
            return;
        if (new SurveyEditor_1.DragDropHelper(this.data, null).isSurveyDragging(e)) {
            this.koDragging(this.questions.length);
        }
    };
    Survey.QuestionBase.prototype["onCreating"] = function () {
        var self = this;
        this.dragDropHelperValue = null;
        this.koIsDragging = ko.observable(false);
        this.dragDropHelper = function () {
            if (self.dragDropHelperValue == null) {
                self.dragDropHelperValue = self.data["onCreateDragDropHelper"] ? self.data["onCreateDragDropHelper"]() : new SurveyEditor_1.DragDropHelper(self.data, null);
                ;
            }
            return self.dragDropHelperValue;
        };
        this.dragOver = function (e) { self.dragDropHelper().doDragDropOver(e, self); };
        this.dragDrop = function (e) { self.dragDropHelper().doDrop(e, self); };
        this.dragStart = function (e) { self.dragDropHelper().startDragQuestion(e, self.name); };
        this.koIsSelected = ko.observable(false);
        this.koOnClick = function () {
            if (self.data == null)
                return;
            self.data["setselectedQuestion"](this);
        };
    };
    Survey.QuestionBase.prototype["onSelectedQuestionChanged"] = function () {
        if (this.data == null)
            return;
        this.koIsSelected(this.data["selectedQuestionValue"] == this);
    };
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    SurveyEditor.editorLocalization = {
        currentLocale: "",
        locales: {},
        getString: function (strName, locale) {
            if (locale === void 0) { locale = null; }
            if (!locale)
                locale = this.currentLocale;
            var loc = locale ? this.locales[this.currentLocale] : SurveyEditor.defaultStrings;
            if (!loc)
                loc = SurveyEditor.defaultStrings;
            var path = strName.split('.');
            var obj = loc;
            for (var i = 0; i < path.length; i++) {
                obj = obj[path[i]];
                if (!obj) {
                    if (loc === SurveyEditor.defaultStrings)
                        return path[i];
                    return this.getString(strName, "en");
                }
            }
            return obj;
        },
        getPropertyName: function (strName, local) {
            if (local === void 0) { local = null; }
            var obj = this.getProperty(strName, local);
            if (obj["name"])
                return obj["name"];
            return obj;
        },
        getPropertyTitle: function (strName, local) {
            if (local === void 0) { local = null; }
            var obj = this.getProperty(strName, local);
            if (obj["title"])
                return obj["title"];
            return "";
        },
        getProperty: function (strName, local) {
            if (local === void 0) { local = null; }
            var obj = this.getString("p." + strName, local);
            if (obj !== strName)
                return obj;
            var pos = strName.indexOf('_');
            if (pos < -1)
                return obj;
            strName = strName.substr(pos + 1);
            return this.getString("p." + strName, local);
        },
        getLocales: function () {
            var res = [];
            res.push("");
            for (var key in this.locales) {
                res.push(key);
            }
            return res;
        }
    };
    SurveyEditor.defaultStrings = {
        //survey templates
        survey: {
            dropQuestion: "Please drop a question here.",
            copy: "Copy"
        },
        //questionTypes
        qt: {
            checkbox: "Checkbox",
            comment: "Comment",
            dropdown: "Dropdown",
            file: "File",
            html: "Html",
            matrix: "Matrix (single choice)",
            matrixdropdown: "Matrix (multiple choice)",
            matrixdynamic: "Matrix (dynamic rows)",
            multipletext: "Multiple Text",
            radiogroup: "Radiogroup",
            rating: "Rating",
            text: "Text"
        },
        //Strings in Editor
        ed: {
            newPageName: "page",
            newQuestionName: "question",
            testSurvey: "Test Survey",
            testSurveyAgain: "Test Survey Again",
            testSurveyWidth: "Survey width: ",
            embedSurvey: "Embed Survey",
            saveSurvey: "Save Survey",
            designer: "Designer",
            jsonEditor: "JSON Editor",
            undo: "Undo",
            redo: "Redo",
            options: "Options",
            generateValidJSON: "Generate Valid JSON",
            generateReadableJSON: "Generate Readable JSON",
            toolbox: "Toolbox",
            delSelObject: "Delete selected object",
            correctJSON: "Please correct JSON.",
            surveyResults: "Survey Result: "
        },
        //Property Editors
        pe: {
            apply: "Apply",
            reset: "Reset",
            close: "Close",
            delete: "Delete",
            addNew: "Add New",
            removeAll: "Remove All",
            edit: "Edit",
            empty: "<empty>",
            testService: "Test the service",
            value: "Value",
            text: "Text",
            required: "Required?",
            hasOther: "Has Other Item",
            name: "Name",
            title: "Title",
            cellType: "Cell Type",
            colCount: "Column Count",
            editProperty: "Edit property '{0}'",
            items: "[ Items: {0} ]",
            enterNewValue: "Please, enter the value.",
            noquestions: "There is no any question in the survey.",
            createtrigger: "Please create a trigger",
            triggerOn: "On ",
            triggerMakePagesVisible: "Make pages visible:",
            triggerMakeQuestionsVisible: "Make questions visible:",
            triggerCompleteText: "Complete the survey if succeed.",
            triggerNotSet: "The trigger is not set",
            triggerRunIf: "Run if",
            triggerSetToName: "Change value of: ",
            triggerSetValue: "to: ",
            triggerIsVariable: "Do not put the variable into the survey result.",
            verbChangeType: "Change type ",
            verbChangePage: "Change page "
        },
        //Operators
        op: {
            empty: "is empty",
            notempty: "is not empty",
            equal: "equals",
            notequal: "not equals",
            contains: "contains",
            notcontains: "not contains",
            greater: "greater",
            less: "less",
            greaterorequal: "greater or equals",
            lessorequal: "Less or Equals"
        },
        //Embed window
        ew: {
            knockout: "Use Knockout version",
            react: "Use React version",
            bootstrap: "For bootstrap framework",
            standard: "No bootstrap",
            showOnPage: "Show survey on a page",
            showInWindow: "Show survey in a window",
            loadFromServer: "Load Survey JSON from server",
            titleScript: "Scripts and styles",
            titleHtml: "HTML",
            titleJavaScript: "JavaScript"
        },
        //Properties
        p: {
            name: "name",
            title: { name: "title", title: "Leave it empty, if it is the same as 'Name'" },
            survey_title: { name: "title", title: "It will be shown on every page." },
            page_title: { name: "title", title: "Page title" }
        }
    };
    SurveyEditor.editorLocalization.locales["en"] = SurveyEditor.defaultStrings;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
// This file is based on JSON5, http://json5.org/
// The modification for getting object and properties location 'at' were maden.
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyJSON5 = (function () {
        function SurveyJSON5(parseType) {
            if (parseType === void 0) { parseType = 0; }
            this.parseType = parseType;
        }
        SurveyJSON5.prototype.parse = function (source, reviver, startFrom, endAt) {
            if (reviver === void 0) { reviver = null; }
            if (startFrom === void 0) { startFrom = 0; }
            if (endAt === void 0) { endAt = -1; }
            var result;
            this.text = String(source);
            this.at = startFrom;
            this.endAt = endAt;
            this.ch = ' ';
            result = this.value();
            this.white();
            if (this.ch) {
                this.error("Syntax error");
            }
            // If there is a reviver function, we recursively walk the new structure,
            // passing each name/value pair to the reviver function for possible
            // transformation, starting with a temporary root object that holds the result
            // in an empty key. If there is not a reviver function, we simply return the
            // result.
            return typeof reviver === 'function' ? (function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            }
                            else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }({ '': result }, '')) : result;
        };
        SurveyJSON5.prototype.error = function (m) {
            // Call error when something is wrong.
            var error = new SyntaxError();
            error.message = m;
            error["at"] = this.at;
            throw error;
        };
        SurveyJSON5.prototype.next = function (c) {
            if (c === void 0) { c = null; }
            // If a c parameter is provided, verify that it matches the current character.
            if (c && c !== this.ch) {
                this.error("Expected '" + c + "' instead of '" + this.ch + "'");
            }
            // Get the this.next character. When there are no more characters,
            // return the empty string.
            this.ch = this.chartAt();
            this.at += 1;
            return this.ch;
        };
        SurveyJSON5.prototype.peek = function () {
            // Get the this.next character without consuming it or
            // assigning it to the this.ch varaible.
            return this.chartAt();
        };
        SurveyJSON5.prototype.chartAt = function () {
            if (this.endAt > -1 && this.at >= this.endAt)
                return '';
            return this.text.charAt(this.at);
        };
        SurveyJSON5.prototype.identifier = function () {
            // Parse an identifier. Normally, reserved words are disallowed here, but we
            // only use this for unquoted object keys, where reserved words are allowed,
            // so we don't check for those here. References:
            // - http://es5.github.com/#x7.6
            // - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
            // - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
            // TODO Identifiers can have Unicode "letters" in them; add support for those.
            var key = this.ch;
            // Identifiers must start with a letter, _ or $.
            if ((this.ch !== '_' && this.ch !== '$') &&
                (this.ch < 'a' || this.ch > 'z') &&
                (this.ch < 'A' || this.ch > 'Z')) {
                this.error("Bad identifier");
            }
            // Subsequent characters can contain digits.
            while (this.next() && (this.ch === '_' || this.ch === '$' ||
                (this.ch >= 'a' && this.ch <= 'z') ||
                (this.ch >= 'A' && this.ch <= 'Z') ||
                (this.ch >= '0' && this.ch <= '9'))) {
                key += this.ch;
            }
            return key;
        };
        SurveyJSON5.prototype.number = function () {
            // Parse a number value.
            var number, sign = '', string = '', base = 10;
            if (this.ch === '-' || this.ch === '+') {
                sign = this.ch;
                this.next(this.ch);
            }
            // support for Infinity (could tweak to allow other words):
            if (this.ch === 'I') {
                number = this.word();
                if (typeof number !== 'number' || isNaN(number)) {
                    this.error('Unexpected word for number');
                }
                return (sign === '-') ? -number : number;
            }
            // support for NaN
            if (this.ch === 'N') {
                number = this.word();
                if (!isNaN(number)) {
                    this.error('expected word to be NaN');
                }
                // ignore sign as -NaN also is NaN
                return number;
            }
            if (this.ch === '0') {
                string += this.ch;
                this.next();
                if (this.ch === 'x' || this.ch === 'X') {
                    string += this.ch;
                    this.next();
                    base = 16;
                }
                else if (this.ch >= '0' && this.ch <= '9') {
                    this.error('Octal literal');
                }
            }
            switch (base) {
                case 10:
                    while (this.ch >= '0' && this.ch <= '9') {
                        string += this.ch;
                        this.next();
                    }
                    if (this.ch === '.') {
                        string += '.';
                        while (this.next() && this.ch >= '0' && this.ch <= '9') {
                            string += this.ch;
                        }
                    }
                    if (this.ch === 'e' || this.ch === 'E') {
                        string += this.ch;
                        this.next();
                        if (this.ch === '-' || this.ch === '+') {
                            string += this.ch;
                            this.next();
                        }
                        while (this.ch >= '0' && this.ch <= '9') {
                            string += this.ch;
                            this.next();
                        }
                    }
                    break;
                case 16:
                    while (this.ch >= '0' && this.ch <= '9' || this.ch >= 'A' && this.ch <= 'F' || this.ch >= 'a' && this.ch <= 'f') {
                        string += this.ch;
                        this.next();
                    }
                    break;
            }
            if (sign === '-') {
                number = -string;
            }
            else {
                number = +string;
            }
            if (!isFinite(number)) {
                this.error("Bad number");
            }
            else {
                return number;
            }
        };
        SurveyJSON5.prototype.string = function () {
            // Parse a string value.
            var hex, i, string = '', delim, // double quote or single quote
            uffff;
            // When parsing for string values, we must look for ' or " and \ characters.
            if (this.ch === '"' || this.ch === "'") {
                delim = this.ch;
                while (this.next()) {
                    if (this.ch === delim) {
                        this.next();
                        return string;
                    }
                    else if (this.ch === '\\') {
                        this.next();
                        if (this.ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(this.next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        }
                        else if (this.ch === '\r') {
                            if (this.peek() === '\n') {
                                this.next();
                            }
                        }
                        else if (typeof SurveyJSON5.escapee[this.ch] === 'string') {
                            string += SurveyJSON5.escapee[this.ch];
                        }
                        else {
                            break;
                        }
                    }
                    else if (this.ch === '\n') {
                        // unescaped newlines are invalid; see:
                        // https://github.com/aseemk/json5/issues/24
                        // TODO this feels special-cased; are there other
                        // invalid unescaped chars?
                        break;
                    }
                    else {
                        string += this.ch;
                    }
                }
            }
            this.error("Bad string");
        };
        SurveyJSON5.prototype.inlineComment = function () {
            // Skip an inline comment, assuming this is one. The current character should
            // be the second / character in the // pair that begins this inline comment.
            // To finish the inline comment, we look for a newline or the end of the text.
            if (this.ch !== '/') {
                this.error("Not an inline comment");
            }
            do {
                this.next();
                if (this.ch === '\n' || this.ch === '\r') {
                    this.next();
                    return;
                }
            } while (this.ch);
        };
        SurveyJSON5.prototype.blockComment = function () {
            // Skip a block comment, assuming this is one. The current character should be
            // the * character in the /* pair that begins this block comment.
            // To finish the block comment, we look for an ending */ pair of characters,
            // but we also watch for the end of text before the comment is terminated.
            if (this.ch !== '*') {
                this.error("Not a block comment");
            }
            do {
                this.next();
                while (this.ch === '*') {
                    this.next('*');
                    if (this.ch === '/') {
                        this.next('/');
                        return;
                    }
                }
            } while (this.ch);
            this.error("Unterminated block comment");
        };
        SurveyJSON5.prototype.comment = function () {
            // Skip a comment, whether inline or block-level, assuming this is one.
            // Comments always begin with a / character.
            if (this.ch !== '/') {
                this.error("Not a comment");
            }
            this.next('/');
            if (this.ch === '/') {
                this.inlineComment();
            }
            else if (this.ch === '*') {
                this.blockComment();
            }
            else {
                this.error("Unrecognized comment");
            }
        };
        SurveyJSON5.prototype.white = function () {
            // Skip whitespace and comments.
            // Note that we're detecting comments by only a single / character.
            // This works since regular expressions are not valid JSON(5), but this will
            // break if there are other valid values that begin with a / character!
            while (this.ch) {
                if (this.ch === '/') {
                    this.comment();
                }
                else if (SurveyJSON5.ws.indexOf(this.ch) >= 0) {
                    this.next();
                }
                else {
                    return;
                }
            }
        };
        SurveyJSON5.prototype.word = function () {
            // true, false, or null.
            switch (this.ch) {
                case 't':
                    this.next('t');
                    this.next('r');
                    this.next('u');
                    this.next('e');
                    return true;
                case 'f':
                    this.next('f');
                    this.next('a');
                    this.next('l');
                    this.next('s');
                    this.next('e');
                    return false;
                case 'n':
                    this.next('n');
                    this.next('u');
                    this.next('l');
                    this.next('l');
                    return null;
                case 'I':
                    this.next('I');
                    this.next('n');
                    this.next('f');
                    this.next('i');
                    this.next('n');
                    this.next('i');
                    this.next('t');
                    this.next('y');
                    return Infinity;
                case 'N':
                    this.next('N');
                    this.next('a');
                    this.next('N');
                    return NaN;
            }
            this.error("Unexpected '" + this.ch + "'");
        };
        SurveyJSON5.prototype.array = function () {
            // Parse an array value.
            var array = [];
            if (this.ch === '[') {
                this.next('[');
                this.white();
                while (this.ch) {
                    if (this.ch === ']') {
                        this.next(']');
                        return array; // Potentially empty array
                    }
                    // ES5 allows omitting elements in arrays, e.g. [,] and
                    // [,null]. We don't allow this in JSON5.
                    if (this.ch === ',') {
                        this.error("Missing array element");
                    }
                    else {
                        array.push(this.value());
                    }
                    this.white();
                    // If there's no comma after this value, this needs to
                    // be the end of the array.
                    if (this.ch !== ',') {
                        this.next(']');
                        return array;
                    }
                    this.next(',');
                    this.white();
                }
            }
            this.error("Bad array");
        };
        SurveyJSON5.prototype.object = function () {
            // Parse an object value.
            var key, start, isFirstProperty = true, object = {};
            if (this.parseType > 0) {
                object[SurveyJSON5.positionName] = { start: this.at - 1 };
            }
            if (this.ch === '{') {
                this.next('{');
                this.white();
                start = this.at - 1;
                while (this.ch) {
                    if (this.ch === '}') {
                        if (this.parseType > 0) {
                            object[SurveyJSON5.positionName].end = start;
                        }
                        this.next('}');
                        return object; // Potentially empty object
                    }
                    // Keys can be unquoted. If they are, they need to be
                    // valid JS identifiers.
                    if (this.ch === '"' || this.ch === "'") {
                        key = this.string();
                    }
                    else {
                        key = this.identifier();
                    }
                    this.white();
                    if (this.parseType > 1) {
                        object[SurveyJSON5.positionName][key] = { start: start, valueStart: this.at };
                    }
                    this.next(':');
                    object[key] = this.value();
                    if (this.parseType > 1) {
                        start = this.at - 1;
                        object[SurveyJSON5.positionName][key].valueEnd = start;
                        object[SurveyJSON5.positionName][key].end = start;
                    }
                    this.white();
                    // If there's no comma after this pair, this needs to be
                    // the end of the object.
                    if (this.ch !== ',') {
                        if (this.parseType > 1) {
                            object[SurveyJSON5.positionName][key].valueEnd--;
                            object[SurveyJSON5.positionName][key].end--;
                        }
                        if (this.parseType > 0) {
                            object[SurveyJSON5.positionName].end = this.at - 1;
                        }
                        this.next('}');
                        return object;
                    }
                    if (this.parseType > 1) {
                        object[SurveyJSON5.positionName][key].valueEnd--;
                        if (!isFirstProperty) {
                            object[SurveyJSON5.positionName][key].end--;
                        }
                    }
                    this.next(',');
                    this.white();
                    isFirstProperty = false;
                }
            }
            this.error("Bad object");
        };
        SurveyJSON5.prototype.value = function () {
            // Parse a JSON value. It could be an object, an array, a string, a number,
            // or a word.
            this.white();
            switch (this.ch) {
                case '{':
                    return this.object();
                case '[':
                    return this.array();
                case '"':
                case "'":
                    return this.string();
                case '-':
                case '+':
                case '.':
                    return this.number();
                default:
                    return this.ch >= '0' && this.ch <= '9' ? this.number() : this.word();
            }
        };
        SurveyJSON5.prototype.stringify = function (obj, replacer, space) {
            if (replacer === void 0) { replacer = null; }
            if (space === void 0) { space = null; }
            if (replacer && (typeof (replacer) !== "function" && !this.isArray(replacer))) {
                throw new Error('Replacer must be a function or an array');
            }
            this.replacer = replacer;
            this.indentStr = this.getIndent(space);
            this.objStack = [];
            // special case...when undefined is used inside of
            // a compound object/array, return null.
            // but when top-level, return undefined
            var topLevelHolder = { "": obj };
            if (obj === undefined) {
                return this.getReplacedValueOrUndefined(topLevelHolder, '', true);
            }
            return this.internalStringify(topLevelHolder, '', true);
        };
        SurveyJSON5.prototype.getIndent = function (space) {
            if (space) {
                if (typeof space === "string") {
                    return space;
                }
                else if (typeof space === "number" && space >= 0) {
                    return this.makeIndent(" ", space, true);
                }
            }
            return "";
        };
        SurveyJSON5.prototype.getReplacedValueOrUndefined = function (holder, key, isTopLevel) {
            var value = holder[key];
            // Replace the value with its toJSON value first, if possible
            if (value && value.toJSON && typeof value.toJSON === "function") {
                value = value.toJSON();
            }
            // If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
            // presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
            if (typeof (this.replacer) === "function") {
                return this.replacer.call(holder, key, value);
            }
            else if (this.replacer) {
                if (isTopLevel || this.isArray(holder) || this.replacer.indexOf(key) >= 0) {
                    return value;
                }
                else {
                    return undefined;
                }
            }
            else {
                return value;
            }
        };
        SurveyJSON5.prototype.isWordChar = function (char) {
            return (char >= 'a' && char <= 'z') ||
                (char >= 'A' && char <= 'Z') ||
                (char >= '0' && char <= '9') ||
                char === '_' || char === '$';
        };
        SurveyJSON5.prototype.isWordStart = function (char) {
            return (char >= 'a' && char <= 'z') ||
                (char >= 'A' && char <= 'Z') ||
                char === '_' || char === '$';
        };
        SurveyJSON5.prototype.isWord = function (key) {
            if (typeof key !== 'string') {
                return false;
            }
            if (!this.isWordStart(key[0])) {
                return false;
            }
            var i = 1, length = key.length;
            while (i < length) {
                if (!this.isWordChar(key[i])) {
                    return false;
                }
                i++;
            }
            return true;
        };
        // polyfills
        SurveyJSON5.prototype.isArray = function (obj) {
            if (Array.isArray) {
                return Array.isArray(obj);
            }
            else {
                return Object.prototype.toString.call(obj) === '[object Array]';
            }
        };
        SurveyJSON5.prototype.isDate = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Date]';
        };
        SurveyJSON5.prototype.isNaN = function (val) {
            return typeof val === 'number' && val !== val;
        };
        SurveyJSON5.prototype.checkForCircular = function (obj) {
            for (var i = 0; i < this.objStack.length; i++) {
                if (this.objStack[i] === obj) {
                    throw new TypeError("Converting circular structure to JSON");
                }
            }
        };
        SurveyJSON5.prototype.makeIndent = function (str, num, noNewLine) {
            if (noNewLine === void 0) { noNewLine = false; }
            if (!str) {
                return "";
            }
            // indentation no more than 10 chars
            if (str.length > 10) {
                str = str.substring(0, 10);
            }
            var indent = noNewLine ? "" : "\n";
            for (var i = 0; i < num; i++) {
                indent += str;
            }
            return indent;
        };
        SurveyJSON5.prototype.escapeString = function (str) {
            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.
            SurveyJSON5.escapable.lastIndex = 0;
            return SurveyJSON5.escapable.test(str) ? '"' + str.replace(SurveyJSON5.escapable, function (a) {
                var c = SurveyJSON5.meta[a];
                return typeof c === 'string' ?
                    c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + str + '"';
        };
        // End
        SurveyJSON5.prototype.internalStringify = function (holder, key, isTopLevel) {
            var buffer, res;
            // Replace the value, if necessary
            var obj_part = this.getReplacedValueOrUndefined(holder, key, isTopLevel);
            if (obj_part && !this.isDate(obj_part)) {
                // unbox objects
                // don't unbox dates, since will turn it into number
                obj_part = obj_part.valueOf();
            }
            switch (typeof obj_part) {
                case "boolean":
                    return obj_part.toString();
                case "number":
                    if (isNaN(obj_part) || !isFinite(obj_part)) {
                        return "null";
                    }
                    return obj_part.toString();
                case "string":
                    return this.escapeString(obj_part.toString());
                case "object":
                    if (obj_part === null) {
                        return "null";
                    }
                    else if (this.isArray(obj_part)) {
                        this.checkForCircular(obj_part);
                        buffer = "[";
                        this.objStack.push(obj_part);
                        for (var i = 0; i < obj_part.length; i++) {
                            res = this.internalStringify(obj_part, i, false);
                            buffer += this.makeIndent(this.indentStr, this.objStack.length);
                            if (res === null || typeof res === "undefined") {
                                buffer += "null";
                            }
                            else {
                                buffer += res;
                            }
                            if (i < obj_part.length - 1) {
                                buffer += ",";
                            }
                            else if (this.indentStr) {
                                buffer += "\n";
                            }
                        }
                        this.objStack.pop();
                        buffer += this.makeIndent(this.indentStr, this.objStack.length, true) + "]";
                    }
                    else {
                        this.checkForCircular(obj_part);
                        buffer = "{";
                        var nonEmpty = false;
                        this.objStack.push(obj_part);
                        for (var prop in obj_part) {
                            if (obj_part.hasOwnProperty(prop)) {
                                var value = this.internalStringify(obj_part, prop, false);
                                isTopLevel = false;
                                if (typeof value !== "undefined" && value !== null) {
                                    buffer += this.makeIndent(this.indentStr, this.objStack.length);
                                    nonEmpty = true;
                                    var propKey = this.isWord(prop) ? prop : this.escapeString(prop);
                                    buffer += propKey + ":" + (this.indentStr ? ' ' : '') + value + ",";
                                }
                            }
                        }
                        this.objStack.pop();
                        if (nonEmpty) {
                            buffer = buffer.substring(0, buffer.length - 1) + this.makeIndent(this.indentStr, this.objStack.length) + "}";
                        }
                        else {
                            buffer = '{}';
                        }
                    }
                    return buffer;
                default:
                    // functions and undefined should be ignored
                    return undefined;
            }
        };
        SurveyJSON5.positionName = "pos";
        SurveyJSON5.escapee = {
            "'": "'",
            '"': '"',
            '\\': '\\',
            '/': '/',
            '\n': '',
            b: '\b',
            f: '\f',
            n: '\n',
            r: '\r',
            t: '\t'
        };
        SurveyJSON5.ws = [
            ' ',
            '\t',
            '\r',
            '\n',
            '\v',
            '\f',
            '\xA0',
            '\uFEFF'
        ];
        // Copied from Crokford's implementation of JSON
        // See https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
        // Begin
        SurveyJSON5.cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        SurveyJSON5.escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        SurveyJSON5.meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        return SurveyJSON5;
    }());
    SurveyEditor.SurveyJSON5 = SurveyJSON5;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyObjectItem = (function () {
        function SurveyObjectItem() {
        }
        return SurveyObjectItem;
    }());
    SurveyEditor.SurveyObjectItem = SurveyObjectItem;
    var SurveyObjects = (function () {
        function SurveyObjects(koObjects, koSelected) {
            this.koObjects = koObjects;
            this.koSelected = koSelected;
        }
        Object.defineProperty(SurveyObjects.prototype, "survey", {
            get: function () { return this.surveyValue; },
            set: function (value) {
                if (this.survey == value)
                    return;
                this.surveyValue = value;
                this.rebuild();
            },
            enumerable: true,
            configurable: true
        });
        SurveyObjects.prototype.addPage = function (page) {
            var pageItem = this.createPage(page);
            var index = this.survey.pages.indexOf(page);
            if (index > 0) {
                var prevPage = this.survey.pages[index - 1];
                index = this.getItemIndex(prevPage) + 1;
                index += prevPage.questions.length;
            }
            else {
                index = 1; //0 - Survey
            }
            this.addItem(pageItem, index);
            index++;
            for (var i = 0; i < page.questions.length; i++) {
                var item = this.createQuestion(page.questions[i]);
                this.addItem(item, index + i);
            }
            this.koSelected(pageItem);
        };
        SurveyObjects.prototype.addQuestion = function (page, question) {
            var index = this.getItemIndex(page);
            if (index < 0)
                return;
            var questionIndex = page.questions.indexOf(question) + 1;
            index += questionIndex;
            var item = this.createQuestion(question);
            this.addItem(item, index);
            this.koSelected(item);
        };
        SurveyObjects.prototype.selectObject = function (obj) {
            var objs = this.koObjects();
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].value == obj) {
                    this.koSelected(objs[i]);
                    return;
                }
            }
        };
        SurveyObjects.prototype.removeObject = function (obj) {
            var index = this.getItemIndex(obj);
            if (index < 0)
                return;
            var countToRemove = 1;
            if (SurveyEditor.SurveyHelper.getObjectType(obj) == SurveyEditor.ObjType.Page) {
                var page = obj;
                countToRemove += page.questions.length;
            }
            this.koObjects.splice(index, countToRemove);
        };
        SurveyObjects.prototype.nameChanged = function (obj) {
            var index = this.getItemIndex(obj);
            if (index < 0)
                return;
            this.koObjects()[index].text(this.getText(obj));
        };
        SurveyObjects.prototype.selectNextQuestion = function (isUp) {
            var question = this.getSelectedQuestion();
            var itemIndex = this.getItemIndex(question);
            if (itemIndex < 0)
                return question;
            var objs = this.koObjects();
            var newItemIndex = itemIndex + (isUp ? -1 : 1);
            if (newItemIndex < objs.length && SurveyEditor.SurveyHelper.getObjectType(objs[newItemIndex].value) == SurveyEditor.ObjType.Question) {
                itemIndex = newItemIndex;
            }
            else {
                newItemIndex = itemIndex;
                while (newItemIndex < objs.length && SurveyEditor.SurveyHelper.getObjectType(objs[newItemIndex].value) == SurveyEditor.ObjType.Question) {
                    itemIndex = newItemIndex;
                    newItemIndex += (isUp ? 1 : -1);
                }
            }
            this.koSelected(objs[itemIndex]);
        };
        SurveyObjects.prototype.getSelectedQuestion = function () {
            if (!this.koSelected())
                return null;
            var obj = this.koSelected().value;
            if (!obj)
                return null;
            return SurveyEditor.SurveyHelper.getObjectType(obj) == SurveyEditor.ObjType.Question ? (obj) : null;
        };
        SurveyObjects.prototype.addItem = function (item, index) {
            if (index > this.koObjects().length) {
                this.koObjects.push(item);
            }
            else {
                this.koObjects.splice(index, 0, item);
            }
        };
        SurveyObjects.prototype.rebuild = function () {
            var objs = [];
            if (this.survey == null) {
                this.koObjects(objs);
                this.koSelected(null);
                return;
            }
            objs.push(this.createItem(this.survey, "Survey"));
            for (var i = 0; i < this.survey.pages.length; i++) {
                var page = this.survey.pages[i];
                objs.push(this.createPage(page));
                for (var j = 0; j < page.questions.length; j++) {
                    objs.push(this.createQuestion(page.questions[j]));
                }
            }
            this.koObjects(objs);
            this.koSelected(this.survey);
        };
        SurveyObjects.prototype.createPage = function (page) {
            return this.createItem(page, this.getText(page));
        };
        SurveyObjects.prototype.createQuestion = function (question) {
            return this.createItem(question, this.getText(question));
        };
        SurveyObjects.prototype.createItem = function (value, text) {
            var item = new SurveyObjectItem();
            item.value = value;
            item.text = ko.observable(text);
            return item;
        };
        SurveyObjects.prototype.getItemIndex = function (value) {
            var objs = this.koObjects();
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].value == value)
                    return i;
            }
            return -1;
        };
        SurveyObjects.prototype.getText = function (obj) {
            var intend = SurveyObjects.intend;
            if (SurveyEditor.SurveyHelper.getObjectType(obj) != SurveyEditor.ObjType.Page) {
                intend += SurveyObjects.intend;
            }
            return intend + SurveyEditor.SurveyHelper.getObjectName(obj);
        };
        SurveyObjects.intend = "...";
        return SurveyObjects;
    }());
    SurveyEditor.SurveyObjects = SurveyObjects;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyModalEditor = (function (_super) {
        __extends(SurveyPropertyModalEditor, _super);
        function SurveyPropertyModalEditor() {
            _super.call(this);
            this.title = ko.observable();
            var self = this;
            self.onApplyClick = function () { self.apply(); };
            self.onResetClick = function () { self.reset(); };
        }
        SurveyPropertyModalEditor.prototype.setTitle = function (value) { this.title(value); };
        SurveyPropertyModalEditor.prototype.hasError = function () { return false; };
        SurveyPropertyModalEditor.prototype.onBeforeApply = function () { };
        SurveyPropertyModalEditor.prototype.reset = function () {
            this.value = this.value;
        };
        SurveyPropertyModalEditor.prototype.setObject = function (value) { this.object = value; };
        Object.defineProperty(SurveyPropertyModalEditor.prototype, "isEditable", {
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyModalEditor.prototype.apply = function () {
            if (this.hasError())
                return;
            this.onBeforeApply();
            if (this.onChanged) {
                this.onChanged(this.value);
            }
        };
        return SurveyPropertyModalEditor;
    }(SurveyEditor.SurveyPropertyEditorBase));
    SurveyEditor.SurveyPropertyModalEditor = SurveyPropertyModalEditor;
    var SurveyPropertyTextEditor = (function (_super) {
        __extends(SurveyPropertyTextEditor, _super);
        function SurveyPropertyTextEditor() {
            _super.call(this);
            this.koValue = ko.observable();
        }
        Object.defineProperty(SurveyPropertyTextEditor.prototype, "editorType", {
            get: function () { return "text"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyPropertyTextEditor.prototype, "isEditable", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyTextEditor.prototype.getValueText = function (value) {
            if (!value)
                return null;
            var str = value;
            if (str.length > 20) {
                str = str.substr(0, 20) + "...";
            }
            return str;
        };
        SurveyPropertyTextEditor.prototype.onValueChanged = function () {
            this.koValue(this.value);
        };
        SurveyPropertyTextEditor.prototype.onBeforeApply = function () {
            this.setValueCore(this.koValue());
        };
        return SurveyPropertyTextEditor;
    }(SurveyPropertyModalEditor));
    SurveyEditor.SurveyPropertyTextEditor = SurveyPropertyTextEditor;
    var SurveyPropertyHtmlEditor = (function (_super) {
        __extends(SurveyPropertyHtmlEditor, _super);
        function SurveyPropertyHtmlEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyPropertyHtmlEditor.prototype, "editorType", {
            get: function () { return "html"; },
            enumerable: true,
            configurable: true
        });
        return SurveyPropertyHtmlEditor;
    }(SurveyPropertyTextEditor));
    SurveyEditor.SurveyPropertyHtmlEditor = SurveyPropertyHtmlEditor;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("text", function () { return new SurveyPropertyTextEditor(); });
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("html", function () { return new SurveyPropertyHtmlEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyItemsEditor = (function (_super) {
        __extends(SurveyPropertyItemsEditor, _super);
        function SurveyPropertyItemsEditor() {
            _super.call(this);
            this.koItems = ko.observableArray();
            this.value = [];
            var self = this;
            self.onDeleteClick = function (item) { self.koItems.remove(item); };
            self.onClearClick = function (item) { self.koItems.removeAll(); };
            self.onAddClick = function () { self.AddItem(); };
        }
        SurveyPropertyItemsEditor.prototype.getValueText = function (value) {
            var len = value ? value.length : 0;
            return SurveyEditor.editorLocalization.getString("pe.items")["format"](len);
        };
        SurveyPropertyItemsEditor.prototype.getCorrectedValue = function (value) {
            if (value == null || !Array.isArray(value))
                value = [];
            return value;
        };
        SurveyPropertyItemsEditor.prototype.AddItem = function () {
            this.koItems.push(this.createNewEditorItem());
        };
        SurveyPropertyItemsEditor.prototype.onValueChanged = function () {
            this.koItems(this.getItemsFromValue());
        };
        SurveyPropertyItemsEditor.prototype.getItemsFromValue = function () {
            var items = [];
            var value = this.value;
            for (var i = 0; i < value.length; i++) {
                items.push(this.createEditorItem(value[i]));
            }
            return items;
        };
        SurveyPropertyItemsEditor.prototype.onBeforeApply = function () {
            var items = [];
            var internalItems = this.koItems();
            for (var i = 0; i < internalItems.length; i++) {
                items.push(this.createItemFromEditorItem(internalItems[i]));
            }
            this.setValueCore(items);
        };
        SurveyPropertyItemsEditor.prototype.createNewEditorItem = function () { throw "Override 'createNewEditorItem' method"; };
        SurveyPropertyItemsEditor.prototype.createEditorItem = function (item) { return item; };
        SurveyPropertyItemsEditor.prototype.createItemFromEditorItem = function (editorItem) { return editorItem; };
        return SurveyPropertyItemsEditor;
    }(SurveyEditor.SurveyPropertyModalEditor));
    SurveyEditor.SurveyPropertyItemsEditor = SurveyPropertyItemsEditor;
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
/// <reference path="propertyItemsEditor.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyItemValuesEditor = (function (_super) {
        __extends(SurveyPropertyItemValuesEditor, _super);
        function SurveyPropertyItemValuesEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyPropertyItemValuesEditor.prototype, "editorType", {
            get: function () { return "itemvalues"; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyItemValuesEditor.prototype.hasError = function () {
            var result = false;
            for (var i = 0; i < this.koItems().length; i++) {
                var item = this.koItems()[i];
                item.koHasError(!item.koValue());
                result = result || item.koHasError();
            }
            return result;
        };
        SurveyPropertyItemValuesEditor.prototype.createNewEditorItem = function () { return { koValue: ko.observable(), koText: ko.observable(), koHasError: ko.observable(false) }; };
        SurveyPropertyItemValuesEditor.prototype.createEditorItem = function (item) {
            var itemValue = item;
            var itemText = null;
            if (item.value) {
                itemValue = item.value;
                itemText = item.text;
            }
            return { koValue: ko.observable(itemValue), koText: ko.observable(itemText), koHasError: ko.observable(false) };
        };
        SurveyPropertyItemValuesEditor.prototype.createItemFromEditorItem = function (editorItem) {
            var alwaySaveTextInPropertyEditors = this.options && this.options.alwaySaveTextInPropertyEditors;
            var text = editorItem.koText();
            if (!alwaySaveTextInPropertyEditors && editorItem.koText() == editorItem.koValue()) {
                text = null;
            }
            return { value: editorItem.koValue(), text: text };
        };
        return SurveyPropertyItemValuesEditor;
    }(SurveyEditor.SurveyPropertyItemsEditor));
    SurveyEditor.SurveyPropertyItemValuesEditor = SurveyPropertyItemValuesEditor;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("itemvalues", function () { return new SurveyPropertyItemValuesEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
/// <reference path="propertyItemsEditor.ts" />
/// <reference path="propertyItemValuesEditor.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyDropdownColumnsEditor = (function (_super) {
        __extends(SurveyPropertyDropdownColumnsEditor, _super);
        function SurveyPropertyDropdownColumnsEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyPropertyDropdownColumnsEditor.prototype, "editorType", {
            get: function () { return "matrixdropdowncolumns"; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyDropdownColumnsEditor.prototype.hasError = function () {
            var result = false;
            for (var i = 0; i < this.koItems().length; i++) {
                result = result || this.koItems()[i].hasError();
            }
            return result;
        };
        SurveyPropertyDropdownColumnsEditor.prototype.createNewEditorItem = function () { return new SurveyPropertyMatrixDropdownColumnsItem(new Survey.MatrixDropdownColumn("", this.options)); };
        SurveyPropertyDropdownColumnsEditor.prototype.createEditorItem = function (item) { return new SurveyPropertyMatrixDropdownColumnsItem(item, this.options); };
        SurveyPropertyDropdownColumnsEditor.prototype.createItemFromEditorItem = function (editorItem) {
            var columItem = editorItem;
            columItem.apply();
            return columItem.column;
        };
        return SurveyPropertyDropdownColumnsEditor;
    }(SurveyEditor.SurveyPropertyItemsEditor));
    SurveyEditor.SurveyPropertyDropdownColumnsEditor = SurveyPropertyDropdownColumnsEditor;
    var SurveyPropertyMatrixDropdownColumnsItem = (function () {
        function SurveyPropertyMatrixDropdownColumnsItem(column, options) {
            if (options === void 0) { options = null; }
            this.column = column;
            this.options = options;
            this.cellTypeChoices = this.getPropertyChoices("cellType");
            this.colCountChoices = this.getPropertyChoices("colCount");
            this.koName = ko.observable(column.name);
            this.koCellType = ko.observable(column.cellType);
            this.koColCount = ko.observable(column.colCount);
            this.koIsRequired = ko.observable(column.isRequired ? true : false);
            this.koHasOther = ko.observable(column.hasOther ? true : false);
            this.koTitle = ko.observable(column.name === column.title ? "" : column.title);
            this.koShowChoices = ko.observable(false);
            this.koChoices = ko.observableArray(column.choices);
            this.koHasError = ko.observable(false);
            this.choicesEditor = new SurveyEditor.SurveyPropertyItemValuesEditor();
            this.choicesEditor.object = this.column;
            this.choicesEditor.value = this.koChoices();
            this.choicesEditor.options = this.options;
            var self = this;
            this.onShowChoicesClick = function () { self.koShowChoices(!self.koShowChoices()); };
            this.koHasChoices = ko.computed(function () { return self.koCellType() == "dropdown" || self.koCellType() == "checkbox" || self.koCellType() == "radiogroup"; });
            this.koHasColCount = ko.computed(function () { return self.koCellType() == "checkbox" || self.koCellType() == "radiogroup"; });
        }
        SurveyPropertyMatrixDropdownColumnsItem.prototype.hasError = function () {
            this.koHasError(!this.koName());
            return this.koHasError() || this.choicesEditor.hasError();
        };
        SurveyPropertyMatrixDropdownColumnsItem.prototype.apply = function () {
            this.column.name = this.koName();
            this.column.title = this.koTitle();
            this.column.cellType = this.koCellType();
            this.column.colCount = this.koColCount();
            this.column.isRequired = this.koIsRequired();
            this.column.hasOther = this.koHasOther();
            this.choicesEditor.onApplyClick();
            this.column.choices = this.choicesEditor.value;
        };
        SurveyPropertyMatrixDropdownColumnsItem.prototype.getPropertyChoices = function (propetyName) {
            var properties = Survey.JsonObject.metaData.getProperties("matrixdropdowncolumn");
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].name == propetyName)
                    return properties[i].choices;
            }
            return [];
        };
        return SurveyPropertyMatrixDropdownColumnsItem;
    }());
    SurveyEditor.SurveyPropertyMatrixDropdownColumnsItem = SurveyPropertyMatrixDropdownColumnsItem;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("matrixdropdowncolumns", function () { return new SurveyPropertyDropdownColumnsEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyResultfullEditor = (function (_super) {
        __extends(SurveyPropertyResultfullEditor, _super);
        function SurveyPropertyResultfullEditor() {
            _super.call(this);
            this.koUrl = ko.observable();
            this.koPath = ko.observable();
            this.koValueName = ko.observable();
            this.koTitleName = ko.observable();
            this.createSurvey();
            var self = this;
            this.koUrl.subscribe(function (newValue) { self.question.choicesByUrl.url = newValue; self.run(); });
            this.koPath.subscribe(function (newValue) { self.question.choicesByUrl.path = newValue; self.run(); });
            this.koValueName.subscribe(function (newValue) { self.question.choicesByUrl.valueName = newValue; self.run(); });
            this.koTitleName.subscribe(function (newValue) { self.question.choicesByUrl.titleName = newValue; self.run(); });
        }
        Object.defineProperty(SurveyPropertyResultfullEditor.prototype, "editorType", {
            get: function () { return "restfull"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SurveyPropertyResultfullEditor.prototype, "restfullValue", {
            get: function () { return this.value; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyResultfullEditor.prototype.getValueText = function (value) {
            if (!value || !value.url)
                return SurveyEditor.editorLocalization.getString("pe.empty");
            var str = value.url;
            if (str.length > 20) {
                str = str.substr(0, 20) + "...";
            }
            return str;
        };
        SurveyPropertyResultfullEditor.prototype.onValueChanged = function () {
            var val = this.restfullValue;
            this.koUrl(val ? val.url : "");
            this.koPath(val ? val.path : "");
            this.koValueName(val ? val.valueName : "");
            this.koTitleName(val ? val.titleName : "");
            this.survey.render("restfullSurvey");
        };
        SurveyPropertyResultfullEditor.prototype.onBeforeApply = function () {
            var val = new Survey.ChoicesRestfull();
            val.url = this.koUrl();
            val.path = this.koPath();
            val.valueName = this.koValueName();
            val.titleName = this.koTitleName();
            this.setValueCore(val);
        };
        SurveyPropertyResultfullEditor.prototype.run = function () {
            this.question.choicesByUrl.run();
        };
        SurveyPropertyResultfullEditor.prototype.createSurvey = function () {
            this.survey = new Survey.Survey();
            this.survey.showNavigationButtons = false;
            this.survey.showQuestionNumbers = "off";
            var page = this.survey.addNewPage("page1");
            this.question = page.addNewQuestion("dropdown", "q1");
            this.question.title = SurveyEditor.editorLocalization.getString("pe.testService");
            this.question.choices = [];
            this.survey.render("restfullSurvey");
        };
        return SurveyPropertyResultfullEditor;
    }(SurveyEditor.SurveyPropertyModalEditor));
    SurveyEditor.SurveyPropertyResultfullEditor = SurveyPropertyResultfullEditor;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("restfull", function () { return new SurveyPropertyResultfullEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
/// <reference path="propertyItemsEditor.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyTextItemsEditor = (function (_super) {
        __extends(SurveyPropertyTextItemsEditor, _super);
        function SurveyPropertyTextItemsEditor() {
            _super.call(this);
        }
        Object.defineProperty(SurveyPropertyTextItemsEditor.prototype, "editorType", {
            get: function () { return "textitems"; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyTextItemsEditor.prototype.createNewEditorItem = function () {
            var objs = [];
            var items = this.koItems();
            for (var i = 0; i < items.length; i++) {
                objs.push({ name: items[i].koName() });
            }
            var editItem = { koName: ko.observable(SurveyEditor.SurveyHelper.getNewName(objs, "text")), koTitle: ko.observable() };
            this.createValidatorsEditor(editItem, []);
            return editItem;
        };
        SurveyPropertyTextItemsEditor.prototype.createEditorItem = function (item) {
            var editItem = { koName: ko.observable(item.name), koTitle: ko.observable(item.title) };
            this.createValidatorsEditor(editItem, item.validators);
            return editItem;
        };
        SurveyPropertyTextItemsEditor.prototype.createItemFromEditorItem = function (editorItem) {
            var itemText = new Survey.MultipleTextItem(editorItem.koName(), editorItem.koTitle());
            itemText.validators = editorItem.validators;
            return itemText;
        };
        SurveyPropertyTextItemsEditor.prototype.createValidatorsEditor = function (item, validators) {
            item.validators = validators.slice();
            var self = this;
            var onItemChanged = function (newValue) { item.validators = newValue; item.koText(self.getText(newValue.length)); };
            var propertyEditor = new SurveyEditor.SurveyPropertyValidatorsEditor();
            item.editor = propertyEditor;
            propertyEditor.onChanged = function (newValue) { onItemChanged(newValue); };
            propertyEditor.object = item;
            propertyEditor.title(SurveyEditor.editorLocalization.getString("pe.editProperty")["format"]("Validators"));
            propertyEditor.value = item.validators;
            item.koText = ko.observable(this.getText(validators.length));
        };
        SurveyPropertyTextItemsEditor.prototype.getText = function (length) {
            return SurveyEditor.editorLocalization.getString("pe.items")["format"](length);
        };
        return SurveyPropertyTextItemsEditor;
    }(SurveyEditor.SurveyPropertyItemsEditor));
    SurveyEditor.SurveyPropertyTextItemsEditor = SurveyPropertyTextItemsEditor;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("textitems", function () { return new SurveyPropertyTextItemsEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
/// <reference path="propertyItemsEditor.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyTriggersEditor = (function (_super) {
        __extends(SurveyPropertyTriggersEditor, _super);
        function SurveyPropertyTriggersEditor() {
            _super.call(this);
            this.availableTriggers = [];
            this.triggerClasses = [];
            var self = this;
            this.onDeleteClick = function () { self.koItems.remove(self.koSelected()); };
            this.onAddClick = function (triggerType) { self.addItem(triggerType); };
            this.koSelected = ko.observable(null);
            this.koPages = ko.observableArray();
            this.koQuestions = ko.observableArray();
            this.triggerClasses = Survey.JsonObject.metaData.getChildrenClasses("surveytrigger", true);
            this.availableTriggers = this.getAvailableTriggers();
        }
        Object.defineProperty(SurveyPropertyTriggersEditor.prototype, "editorType", {
            get: function () { return "triggers"; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyTriggersEditor.prototype.onValueChanged = function () {
            _super.prototype.onValueChanged.call(this);
            if (this.object) {
                this.koPages(this.getNames(this.object.pages));
                this.koQuestions(this.getNames(this.object.getAllQuestions()));
            }
            if (this.koSelected) {
                this.koSelected(this.koItems().length > 0 ? this.koItems()[0] : null);
            }
        };
        SurveyPropertyTriggersEditor.prototype.addItem = function (triggerType) {
            var trigger = Survey.JsonObject.metaData.createClass(triggerType);
            var triggerItem = this.createPropertyTrigger(trigger);
            this.koItems.push(triggerItem);
            this.koSelected(triggerItem);
        };
        SurveyPropertyTriggersEditor.prototype.createEditorItem = function (item) {
            var jsonObj = new Survey.JsonObject();
            var trigger = Survey.JsonObject.metaData.createClass(item.getType());
            jsonObj.toObject(item, trigger);
            return this.createPropertyTrigger(trigger);
        };
        SurveyPropertyTriggersEditor.prototype.createItemFromEditorItem = function (editorItem) {
            var editorTrigger = editorItem;
            return editorTrigger.createTrigger();
        };
        SurveyPropertyTriggersEditor.prototype.getAvailableTriggers = function () {
            var result = [];
            for (var i = 0; i < this.triggerClasses.length; i++) {
                result.push(this.triggerClasses[i].name);
            }
            return result;
        };
        SurveyPropertyTriggersEditor.prototype.getNames = function (items) {
            var names = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item["name"]) {
                    names.push(item["name"]);
                }
            }
            return names;
        };
        SurveyPropertyTriggersEditor.prototype.createPropertyTrigger = function (trigger) {
            var triggerItem = null;
            if (trigger.getType() == "visibletrigger") {
                triggerItem = new SurveyPropertyVisibleTrigger(trigger, this.koPages, this.koQuestions);
            }
            if (trigger.getType() == "setvaluetrigger") {
                triggerItem = new SurveyPropertySetValueTrigger(trigger, this.koQuestions);
            }
            if (!triggerItem) {
                triggerItem = new SurveyPropertyTrigger(trigger);
            }
            return triggerItem;
        };
        return SurveyPropertyTriggersEditor;
    }(SurveyEditor.SurveyPropertyItemsEditor));
    SurveyEditor.SurveyPropertyTriggersEditor = SurveyPropertyTriggersEditor;
    var SurveyPropertyTrigger = (function () {
        function SurveyPropertyTrigger(trigger) {
            this.trigger = trigger;
            this.operators = ["empty", "notempty", "equal", "notequal", "contains", "notcontains", "greater", "less", "greaterorequal", "lessorequal"];
            this.availableOperators = [];
            this.createOperators();
            this.triggerType = trigger.getType();
            this.koType = ko.observable(this.triggerType);
            this.koName = ko.observable(trigger.name);
            this.koOperator = ko.observable(trigger.operator);
            this.koValue = ko.observable(trigger.value);
            var self = this;
            this.koRequireValue = ko.computed(function () { return self.koOperator() != "empty" && self.koOperator() != "notempty"; });
            this.koIsValid = ko.computed(function () { if (self.koName() && (!self.koRequireValue() || self.koValue()))
                return true; return false; });
            this.koText = ko.computed(function () { self.koName(); self.koOperator(); self.koValue(); return self.getText(); });
        }
        SurveyPropertyTrigger.prototype.createTrigger = function () {
            var trigger = Survey.JsonObject.metaData.createClass(this.triggerType);
            trigger.name = this.koName();
            trigger.operator = this.koOperator();
            trigger.value = this.koValue();
            return trigger;
        };
        SurveyPropertyTrigger.prototype.createOperators = function () {
            for (var i = 0; i < this.operators.length; i++) {
                var name = this.operators[i];
                this.availableOperators.push({ name: name, text: SurveyEditor.editorLocalization.getString("op." + name) });
            }
        };
        SurveyPropertyTrigger.prototype.getText = function () {
            if (!this.koIsValid())
                return SurveyEditor.editorLocalization.getString("pe.triggerNotSet");
            return SurveyEditor.editorLocalization.getString("pe.triggerRunIf") + " '" + this.koName() + "' " + this.getOperatorText() + this.getValueText();
        };
        SurveyPropertyTrigger.prototype.getOperatorText = function () {
            var op = this.koOperator();
            for (var i = 0; i < this.availableOperators.length; i++) {
                if (this.availableOperators[i].name == op)
                    return this.availableOperators[i].text;
            }
            return op;
        };
        SurveyPropertyTrigger.prototype.getValueText = function () {
            if (!this.koRequireValue())
                return "";
            return " " + this.koValue();
        };
        return SurveyPropertyTrigger;
    }());
    SurveyEditor.SurveyPropertyTrigger = SurveyPropertyTrigger;
    var SurveyPropertyVisibleTrigger = (function (_super) {
        __extends(SurveyPropertyVisibleTrigger, _super);
        function SurveyPropertyVisibleTrigger(trigger, koPages, koQuestions) {
            _super.call(this, trigger);
            this.trigger = trigger;
            this.pages = new SurveyPropertyTriggerObjects(SurveyEditor.editorLocalization.getString("pe.triggerMakePagesVisible"), koPages(), trigger.pages);
            this.questions = new SurveyPropertyTriggerObjects(SurveyEditor.editorLocalization.getString("pe.triggerMakeQuestionsVisible"), koQuestions(), trigger.questions);
        }
        SurveyPropertyVisibleTrigger.prototype.createTrigger = function () {
            var trigger = _super.prototype.createTrigger.call(this);
            trigger.pages = this.pages.koChoosen();
            trigger.questions = this.questions.koChoosen();
            return trigger;
        };
        return SurveyPropertyVisibleTrigger;
    }(SurveyPropertyTrigger));
    SurveyEditor.SurveyPropertyVisibleTrigger = SurveyPropertyVisibleTrigger;
    var SurveyPropertySetValueTrigger = (function (_super) {
        __extends(SurveyPropertySetValueTrigger, _super);
        function SurveyPropertySetValueTrigger(trigger, koQuestions) {
            _super.call(this, trigger);
            this.trigger = trigger;
            this.koQuestions = koQuestions;
            this.kosetToName = ko.observable(trigger.setToName);
            this.kosetValue = ko.observable(trigger.setValue);
            this.koisVariable = ko.observable(trigger.isVariable);
        }
        SurveyPropertySetValueTrigger.prototype.createTrigger = function () {
            var trigger = _super.prototype.createTrigger.call(this);
            trigger.setToName = this.kosetToName();
            trigger.setValue = this.kosetValue();
            trigger.isVariable = this.koisVariable();
            return trigger;
        };
        return SurveyPropertySetValueTrigger;
    }(SurveyPropertyTrigger));
    SurveyEditor.SurveyPropertySetValueTrigger = SurveyPropertySetValueTrigger;
    var SurveyPropertyTriggerObjects = (function () {
        function SurveyPropertyTriggerObjects(title, allObjects, choosenObjects) {
            this.title = title;
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
            this.onDeleteClick = function () { self.deleteItem(); };
            this.onAddClick = function () { self.addItem(); };
        }
        SurveyPropertyTriggerObjects.prototype.deleteItem = function () {
            this.changeItems(this.koChoosenSelected(), this.koChoosen, this.koObjects);
        };
        SurveyPropertyTriggerObjects.prototype.addItem = function () {
            this.changeItems(this.koSelected(), this.koObjects, this.koChoosen);
        };
        SurveyPropertyTriggerObjects.prototype.changeItems = function (item, removedFrom, addTo) {
            removedFrom.remove(item);
            addTo.push(item);
            removedFrom.sort();
            addTo.sort();
        };
        return SurveyPropertyTriggerObjects;
    }());
    SurveyEditor.SurveyPropertyTriggerObjects = SurveyPropertyTriggerObjects;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("triggers", function () { return new SurveyPropertyTriggersEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

/*!
* surveyjs Editor v0.9.12
* (c) Andrew Telnov - http://surveyjs.org/builder/
* Github - https://github.com/andrewtelnov/survey.js.editor
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="propertyEditorBase.ts" />
/// <reference path="propertyModalEditor.ts" />
/// <reference path="propertyItemsEditor.ts" />
var SurveyEditor;
(function (SurveyEditor) {
    var SurveyPropertyValidatorsEditor = (function (_super) {
        __extends(SurveyPropertyValidatorsEditor, _super);
        function SurveyPropertyValidatorsEditor() {
            _super.call(this);
            this.availableValidators = [];
            this.validatorClasses = [];
            var self = this;
            this.selectedObjectEditor = new SurveyEditor.SurveyObjectEditor();
            this.selectedObjectEditor.onPropertyValueChanged.add(function (sender, options) {
                self.onPropertyValueChanged(options.property, options.object, options.newValue);
            });
            this.koSelected = ko.observable(null);
            this.koSelected.subscribe(function (newValue) { self.selectedObjectEditor.selectedObject = newValue != null ? newValue.validator : null; });
            this.validatorClasses = Survey.JsonObject.metaData.getChildrenClasses("surveyvalidator", true);
            this.availableValidators = this.getAvailableValidators();
            this.onDeleteClick = function () { self.koItems.remove(self.koSelected()); };
            this.onAddClick = function (validatorType) { self.addItem(validatorType); };
        }
        Object.defineProperty(SurveyPropertyValidatorsEditor.prototype, "editorType", {
            get: function () { return "validators"; },
            enumerable: true,
            configurable: true
        });
        SurveyPropertyValidatorsEditor.prototype.onValueChanged = function () {
            _super.prototype.onValueChanged.call(this);
            if (this.koSelected) {
                this.koSelected(this.koItems().length > 0 ? this.koItems()[0] : null);
            }
        };
        SurveyPropertyValidatorsEditor.prototype.createEditorItem = function (item) {
            var jsonObj = new Survey.JsonObject();
            var validator = Survey.JsonObject.metaData.createClass(item.getType());
            jsonObj.toObject(item, validator);
            return new SurveyPropertyValidatorItem(validator);
        };
        SurveyPropertyValidatorsEditor.prototype.createItemFromEditorItem = function (editorItem) {
            var item = editorItem;
            return item.validator;
        };
        SurveyPropertyValidatorsEditor.prototype.addItem = function (validatorType) {
            var newValidator = new SurveyPropertyValidatorItem(Survey.JsonObject.metaData.createClass(validatorType));
            this.koItems.push(newValidator);
            this.koSelected(newValidator);
        };
        SurveyPropertyValidatorsEditor.prototype.getAvailableValidators = function () {
            var result = [];
            for (var i = 0; i < this.validatorClasses.length; i++) {
                result.push(this.validatorClasses[i].name);
            }
            return result;
        };
        SurveyPropertyValidatorsEditor.prototype.onPropertyValueChanged = function (property, obj, newValue) {
            if (this.koSelected() == null)
                return;
            this.koSelected().validator[property.name] = newValue;
        };
        return SurveyPropertyValidatorsEditor;
    }(SurveyEditor.SurveyPropertyItemsEditor));
    SurveyEditor.SurveyPropertyValidatorsEditor = SurveyPropertyValidatorsEditor;
    var SurveyPropertyValidatorItem = (function () {
        function SurveyPropertyValidatorItem(validator) {
            this.validator = validator;
            this.text = validator.getType();
        }
        return SurveyPropertyValidatorItem;
    }());
    SurveyEditor.SurveyPropertyValidatorItem = SurveyPropertyValidatorItem;
    SurveyEditor.SurveyPropertyEditorBase.registerEditor("validators", function () { return new SurveyPropertyValidatorsEditor(); });
})(SurveyEditor || (SurveyEditor = {}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRyYWdkcm9waGVscGVyLnRzIiwicHJvcGVydHlFZGl0b3JzL3Byb3BlcnR5RWRpdG9yQmFzZS50cyIsIm9iamVjdFByb3BlcnR5LnRzIiwib2JqZWN0RWRpdG9yLnRzIiwicGFnZXNFZGl0b3IudHMiLCJ0ZXh0V29ya2VyLnRzIiwic3VydmV5SGVscGVyLnRzIiwic3VydmV5RW1iZWRpbmdXaW5kb3cudHMiLCJvYmplY3RWZXJicy50cyIsInVuZG9yZWRvLnRzIiwidGVtcGxhdGVFZGl0b3Iua28uaHRtbC50cyIsInRlbXBsYXRlX3BhZ2UuaHRtbC50cyIsInRlbXBsYXRlX3F1ZXN0aW9uLmh0bWwudHMiLCJlZGl0b3IudHMiLCJlZGl0b3JMb2NhbGl6YXRpb24udHMiLCJqc29uNS50cyIsInN1cnZleU9iamVjdHMudHMiLCJwcm9wZXJ0eUVkaXRvcnMvcHJvcGVydHlNb2RhbEVkaXRvci50cyIsInByb3BlcnR5RWRpdG9ycy9wcm9wZXJ0eUl0ZW1zRWRpdG9yLnRzIiwicHJvcGVydHlFZGl0b3JzL3Byb3BlcnR5SXRlbVZhbHVlc0VkaXRvci50cyIsInByb3BlcnR5RWRpdG9ycy9wcm9wZXJ0eU1hdHJpeERyb3Bkb3duQ29sdW1uc0VkaXRvci50cyIsInByb3BlcnR5RWRpdG9ycy9wcm9wZXJ0eVJlc3RmdWxsRWRpdG9yLnRzIiwicHJvcGVydHlFZGl0b3JzL3Byb3BlcnR5VGV4dEl0ZW1zRWRpdG9yLnRzIiwicHJvcGVydHlFZGl0b3JzL3Byb3BlcnR5VHJpZ2dlcnNFZGl0b3IudHMiLCJwcm9wZXJ0eUVkaXRvcnMvcHJvcGVydHlWYWxpZGF0b3JzRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0VBSUU7QUFFRixJQUFPLFlBQVksQ0ErSWxCO0FBL0lELFdBQU8sWUFBWSxFQUFDLENBQUM7SUFDakI7UUFLSSx3QkFBbUIsSUFBb0IsRUFBRSxrQkFBNkI7WUFBbkQsU0FBSSxHQUFKLElBQUksQ0FBZ0I7WUFDbkMsSUFBSSxD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QyxFQWhFTSxZQUFZLEtBQVosWUFBWSxRQWdFbEIiLCJmaWxlIjoic3VydmV5ZWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4qIHN1cnZleWpzIEVkaXRvciB2MC45LjEyXG4qIChjKSBBbmRyZXcgVGVsbm92IC0gaHR0cDovL3N1cnZleWpzLm9yZy9idWlsZGVyL1xuKiBHaXRodWIgLSBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3dGVsbm92L3N1cnZleS5qcy5lZGl0b3JcbiovXG5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuICAgIGV4cG9ydCBjbGFzcyBEcmFnRHJvcEhlbHBlciB7XG4gICAgICAgIHN0YXRpYyBkYXRhU3RhcnQ6IHN0cmluZyA9IFwic3VydmV5anMsXCI7XG4gICAgICAgIHN0YXRpYyBkcmFnRGF0YTogYW55ID0ge3RleHQ6IFwiXCIsIGpzb246IG51bGwgfTtcbiAgICAgICAgc3RhdGljIHByZXZFdmVudCA9IHsgcXVlc3Rpb246IG51bGwsIHg6IC0xLCB5OiAtMSB9O1xuICAgICAgICBwcml2YXRlIG9uTW9kaWZpZWRDYWxsYmFjazogKCkgPT4gYW55O1xuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YTogU3VydmV5LklTdXJ2ZXksIG9uTW9kaWZpZWRDYWxsYmFjazogKCkgPT4gYW55KSB7XG4gICAgICAgICAgICB0aGlzLm9uTW9kaWZpZWRDYWxsYmFjayA9IG9uTW9kaWZpZWRDYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IHN1cnZleSgpOiBTdXJ2ZXkuU3VydmV5IHsgcmV0dXJuIDxTdXJ2ZXkuU3VydmV5PnRoaXMuZGF0YTsgfVxuICAgICAgICBwdWJsaWMgc3RhcnREcmFnTmV3UXVlc3Rpb24oZXZlbnQ6IERyYWdFdmVudCwgcXVlc3Rpb25UeXBlOiBzdHJpbmcsIHF1ZXN0aW9uTmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGEoZXZlbnQsIERyYWdEcm9wSGVscGVyLmRhdGFTdGFydCArIFwicXVlc3Rpb250eXBlOlwiICsgcXVlc3Rpb25UeXBlICsgXCIscXVlc3Rpb25uYW1lOlwiICsgcXVlc3Rpb25OYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc3RhcnREcmFnUXVlc3Rpb24oZXZlbnQ6IERyYWdFdmVudCwgcXVlc3Rpb25OYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YShldmVudCwgRHJhZ0Ryb3BIZWxwZXIuZGF0YVN0YXJ0ICsgXCJxdWVzdGlvbm5hbWU6XCIgKyBxdWVzdGlvbk5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBzdGFydERyYWdDb3BpZWRRdWVzdGlvbihldmVudDogRHJhZ0V2ZW50LCBxdWVzdGlvbk5hbWU6IHN0cmluZywgcXVlc3Rpb25Kc29uOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YShldmVudCwgRHJhZ0Ryb3BIZWxwZXIuZGF0YVN0YXJ0ICsgXCJxdWVzdGlvbm5hbWU6XCIgKyBxdWVzdGlvbk5hbWUsIHF1ZXN0aW9uSnNvbik7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGlzU3VydmV5RHJhZ2dpbmcoZXZlbnQ6IERyYWdFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgaWYgKCFldmVudCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmdldERhdGEoZXZlbnQpLnRleHQ7XG4gICAgICAgICAgICByZXR1cm4gZGF0YSAmJiBkYXRhLmluZGV4T2YoRHJhZ0Ryb3BIZWxwZXIuZGF0YVN0YXJ0KSA9PSAwO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBkb0RyYWdEcm9wT3ZlcihldmVudDogRHJhZ0V2ZW50LCBxdWVzdGlvbjogU3VydmV5LlF1ZXN0aW9uQmFzZSkge1xuICAgICAgICAgICAgZXZlbnQgPSB0aGlzLmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIGlmICghcXVlc3Rpb24gfHwgIXRoaXMuaXNTdXJ2ZXlEcmFnZ2luZyhldmVudCkgfHwgdGhpcy5pc1NhbWVQbGFjZShldmVudCwgcXVlc3Rpb24pKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmdldFF1ZXN0aW9uSW5kZXgoZXZlbnQsIHF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5LmN1cnJlbnRQYWdlW1wia29EcmFnZ2luZ1wiXShpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGRvRHJvcChldmVudDogRHJhZ0V2ZW50LCBxdWVzdGlvbjogU3VydmV5LlF1ZXN0aW9uQmFzZSA9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNTdXJ2ZXlEcmFnZ2luZyhldmVudCkpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5LmN1cnJlbnRQYWdlW1wia29EcmFnZ2luZ1wiXSgtMSk7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmdldFF1ZXN0aW9uSW5kZXgoZXZlbnQsIHF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHZhciBkYXRhSW5mbyA9IHRoaXMuZ2V0RGF0YUluZm8oZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5jbGVhckRhdGEoKTtcbiAgICAgICAgICAgIGlmICghZGF0YUluZm8pIHJldHVybjtcbiAgICAgICAgICAgIHZhciB0YXJnZXRRdWVzdGlvbiA9IG51bGw7XG4gICAgICAgICAgICB2YXIganNvbiA9IGRhdGFJbmZvW1wianNvblwiXTtcbiAgICAgICAgICAgIGlmIChqc29uKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0UXVlc3Rpb24gPSBTdXJ2ZXkuUXVlc3Rpb25GYWN0b3J5Lkluc3RhbmNlLmNyZWF0ZVF1ZXN0aW9uKGpzb25bXCJ0eXBlXCJdLCBuYW1lKTtcbiAgICAgICAgICAgICAgICBuZXcgU3VydmV5Lkpzb25PYmplY3QoKS50b09iamVjdChqc29uLCB0YXJnZXRRdWVzdGlvbik7XG4gICAgICAgICAgICAgICAgdGFyZ2V0UXVlc3Rpb24ubmFtZSA9IGRhdGFJbmZvW1wicXVlc3Rpb25uYW1lXCJdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0YXJnZXRRdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHRhcmdldFF1ZXN0aW9uID0gPFN1cnZleS5RdWVzdGlvbkJhc2U+dGhpcy5zdXJ2ZXkuZ2V0UXVlc3Rpb25CeU5hbWUoZGF0YUluZm9bXCJxdWVzdGlvbm5hbWVcIl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0YXJnZXRRdWVzdGlvbiAmJiBkYXRhSW5mb1tcInF1ZXN0aW9udHlwZVwiXSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFF1ZXN0aW9uID0gU3VydmV5LlF1ZXN0aW9uRmFjdG9yeS5JbnN0YW5jZS5jcmVhdGVRdWVzdGlvbihkYXRhSW5mb1tcInF1ZXN0aW9udHlwZVwiXSwgZGF0YUluZm9bXCJxdWVzdGlvbm5hbWVcIl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0YXJnZXRRdWVzdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5tb3ZlUXVlc3Rpb25Ubyh0YXJnZXRRdWVzdGlvbiwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0UXVlc3Rpb25JbmRleChldmVudDogRHJhZ0V2ZW50LCBxdWVzdGlvbjogU3VydmV5LlF1ZXN0aW9uQmFzZSkge1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLnN1cnZleS5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgIGlmICghcXVlc3Rpb24pIHJldHVybiBwYWdlLnF1ZXN0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBwYWdlLnF1ZXN0aW9ucy5pbmRleE9mKHF1ZXN0aW9uKTtcbiAgICAgICAgICAgIGV2ZW50ID0gdGhpcy5nZXRFdmVudChldmVudCk7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gPG51bWJlcj5ldmVudC5jdXJyZW50VGFyZ2V0W1wiY2xpZW50SGVpZ2h0XCJdO1xuICAgICAgICAgICAgdmFyIHkgPSBldmVudC5vZmZzZXRZO1xuICAgICAgICAgICAgaWYgKGV2ZW50Lmhhc093blByb3BlcnR5KCdsYXllclgnKSkge1xuICAgICAgICAgICAgICAgIHkgPSBldmVudC5sYXllclkgLSA8bnVtYmVyPmV2ZW50LmN1cnJlbnRUYXJnZXRbXCJvZmZzZXRUb3BcIl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeSA+IGhlaWdodCAvIDIpIGluZGV4KytcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGlzU2FtZVBsYWNlKGV2ZW50OiBEcmFnRXZlbnQsIHF1ZXN0aW9uOiBTdXJ2ZXkuUXVlc3Rpb25CYXNlKTogYm9vbGVhbiB7XG4gICAgICAgICAgICB2YXIgcHJldiA9IERyYWdEcm9wSGVscGVyLnByZXZFdmVudDtcbiAgICAgICAgICAgIGlmIChwcmV2LnF1ZXN0aW9uICE9IHF1ZXN0aW9uIHx8IE1hdGguYWJzKGV2ZW50LmNsaWVudFggLSBwcmV2LngpID4gNSB8fCBNYXRoLmFicyhldmVudC5jbGllbnRZIC0gcHJldi55KSA+IDUpIHtcbiAgICAgICAgICAgICAgICBwcmV2LnF1ZXN0aW9uID0gcXVlc3Rpb247XG4gICAgICAgICAgICAgICAgcHJldi54ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgICAgICAgICBwcmV2LnkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0RXZlbnQoZXZlbnQ6IERyYWdFdmVudCk6IERyYWdFdmVudCB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnRbXCJvcmlnaW5hbEV2ZW50XCJdID8gZXZlbnRbXCJvcmlnaW5hbEV2ZW50XCJdIDogZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBtb3ZlUXVlc3Rpb25Ubyh0YXJnZXRRdWVzdGlvbjogU3VydmV5LlF1ZXN0aW9uQmFzZSwgaW5kZXg6IG51bWJlcikge1xuICAgICAgICAgICAgaWYgKHRhcmdldFF1ZXN0aW9uID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5zdXJ2ZXkuZ2V0UGFnZUJ5UXVlc3Rpb24odGFyZ2V0UXVlc3Rpb24pO1xuICAgICAgICAgICAgaWYgKHBhZ2UpIHtcbiAgICAgICAgICAgICAgICBwYWdlLnJlbW92ZVF1ZXN0aW9uKHRhcmdldFF1ZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3VydmV5LmN1cnJlbnRQYWdlLmFkZFF1ZXN0aW9uKHRhcmdldFF1ZXN0aW9uLCBpbmRleCk7XG4gICAgICAgICAgICBpZiAodGhpcy5vbk1vZGlmaWVkQ2FsbGJhY2spIHRoaXMub25Nb2RpZmllZENhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXREYXRhSW5mbyhldmVudDogRHJhZ0V2ZW50KTogYW55IHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5nZXREYXRhKGV2ZW50KTtcbiAgICAgICAgICAgIGlmICghZGF0YSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGRhdGEudGV4dC5zdWJzdHIoRHJhZ0Ryb3BIZWxwZXIuZGF0YVN0YXJ0Lmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSB0ZXh0LnNwbGl0KCcsJyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge2pzb246IG51bGx9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gYXJyYXlbaV0uc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbaXRlbVswXV0gPSBpdGVtWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0Lmpzb24gPSBkYXRhLmpzb247XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0WShlbGVtZW50OiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gMDtcblxuICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gKGVsZW1lbnQub2Zmc2V0VG9wIC0gZWxlbWVudC5zY3JvbGxUb3AgKyBlbGVtZW50LmNsaWVudFRvcCk7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IDxIVE1MRWxlbWVudD5lbGVtZW50Lm9mZnNldFBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzZXREYXRhKGV2ZW50OiBEcmFnRXZlbnQsIHRleHQ6IHN0cmluZywganNvbjogYW55ID0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50W1wib3JpZ2luYWxFdmVudFwiXSkge1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gZXZlbnRbXCJvcmlnaW5hbEV2ZW50XCJdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiVGV4dFwiLCB0ZXh0KTtcbiAgICAgICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwiY29weVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRHJhZ0Ryb3BIZWxwZXIuZHJhZ0RhdGEgPSB7IHRleHQ6IHRleHQsIGpzb246IGpzb24gfTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldERhdGEoZXZlbnQ6IERyYWdFdmVudCk6IGFueSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRbXCJvcmlnaW5hbEV2ZW50XCJdKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBldmVudFtcIm9yaWdpbmFsRXZlbnRcIl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBldmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcIlRleHRcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgRHJhZ0Ryb3BIZWxwZXIuZHJhZ0RhdGEudGV4dCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIERyYWdEcm9wSGVscGVyLmRyYWdEYXRhO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY2xlYXJEYXRhKCkge1xuICAgICAgICAgICAgRHJhZ0Ryb3BIZWxwZXIuZHJhZ0RhdGEgPSB7dGV4dDogXCJcIiwganNvbjogbnVsbH07XG4gICAgICAgICAgICB2YXIgcHJldiA9IERyYWdEcm9wSGVscGVyLnByZXZFdmVudDtcbiAgICAgICAgICAgIHByZXYucXVlc3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgcHJldi54ID0gLTE7XG4gICAgICAgICAgICBwcmV2LnkgPSAtMTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJtb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWZhdWx0RWRpdG9yOiBzdHJpbmcgPSBcInN0cmluZ1wiO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBlZGl0b3JSZWdpc3RlcmVkTGlzdCA9IHt9O1xuICAgICAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyRWRpdG9yKG5hbWU6IHN0cmluZywgY3JlYXRvcjogKCkgPT4gU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlKSB7XG4gICAgICAgICAgICBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UuZWRpdG9yUmVnaXN0ZXJlZExpc3RbbmFtZV0gPSBjcmVhdG9yO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRWRpdG9yKGVkaXRvclR5cGU6IHN0cmluZywgZnVuYzogKG5ld1ZhbHVlOiBhbnkpID0+IGFueSk6IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZSB7XG4gICAgICAgICAgICB2YXIgY3JlYXRvciA9IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZS5lZGl0b3JSZWdpc3RlcmVkTGlzdFtlZGl0b3JUeXBlXTtcbiAgICAgICAgICAgIGlmICghY3JlYXRvcikgY3JlYXRvciA9IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZS5lZGl0b3JSZWdpc3RlcmVkTGlzdFtTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UuZGVmYXVsdEVkaXRvcl07XG4gICAgICAgICAgICB2YXIgcHJvcGVydHlFZGl0b3IgPSBjcmVhdG9yKCk7XG4gICAgICAgICAgICBwcm9wZXJ0eUVkaXRvci5vbkNoYW5nZWQgPSBmdW5jO1xuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5RWRpdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2YWx1ZV86IGFueSA9IG51bGw7XG4gICAgICAgIHB1YmxpYyBvcHRpb25zOiBhbnkgPSBudWxsO1xuICAgICAgICBwdWJsaWMgb25DaGFuZ2VkOiAobmV3VmFsdWU6IGFueSkgPT4gYW55O1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IGVkaXRvclR5cGUoKTogc3RyaW5nIHsgdGhyb3cgXCJlZGl0b3JUeXBlIGlzIG5vdCBkZWZpbmVkXCI7IH1cbiAgICAgICAgcHVibGljIGdldFZhbHVlVGV4dCh2YWx1ZTogYW55KTogc3RyaW5nIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICAgIHB1YmxpYyBnZXQgdmFsdWUoKTogYW55IHsgcmV0dXJuIHRoaXMudmFsdWVfOyB9XG4gICAgICAgIHB1YmxpYyBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmdldENvcnJlY3RlZFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsdWVDb3JlKHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMub25WYWx1ZUNoYW5nZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgc2V0VmFsdWVDb3JlKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWVfID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHNldFRpdGxlKHZhbHVlOiBzdHJpbmcpIHsgfVxuICAgICAgICBwdWJsaWMgc2V0T2JqZWN0KHZhbHVlOiBhbnkpIHsgfVxuICAgICAgICBwcm90ZWN0ZWQgb25WYWx1ZUNoYW5nZWQoKSB7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGdldENvcnJlY3RlZFZhbHVlKHZhbHVlOiBhbnkpOiBhbnkgeyAgcmV0dXJuIHZhbHVlOyAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5U3RyaW5nUHJvcGVydHlFZGl0b3IgZXh0ZW5kcyBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBlZGl0b3JUeXBlKCk6IHN0cmluZyB7IHJldHVybiBcInN0cmluZ1wiOyB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlEcm9wZG93blByb3BlcnR5RWRpdG9yIGV4dGVuZHMgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgZWRpdG9yVHlwZSgpOiBzdHJpbmcgeyByZXR1cm4gXCJkcm9wZG93blwiOyB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlCb29sZWFuUHJvcGVydHlFZGl0b3IgZXh0ZW5kcyBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBlZGl0b3JUeXBlKCk6IHN0cmluZyB7IHJldHVybiBcImJvb2xlYW5cIjsgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5TnVtYmVyUHJvcGVydHlFZGl0b3IgZXh0ZW5kcyBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBlZGl0b3JUeXBlKCk6IHN0cmluZyB7IHJldHVybiBcIm51bWJlclwiOyB9XG4gICAgfVxuXG4gICAgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlLnJlZ2lzdGVyRWRpdG9yKFwic3RyaW5nXCIsIGZ1bmN0aW9uICgpOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UgeyByZXR1cm4gbmV3IFN1cnZleVN0cmluZ1Byb3BlcnR5RWRpdG9yKCk7IH0pO1xuICAgIFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZS5yZWdpc3RlckVkaXRvcihcImRyb3Bkb3duXCIsIGZ1bmN0aW9uICgpOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UgeyByZXR1cm4gbmV3IFN1cnZleURyb3Bkb3duUHJvcGVydHlFZGl0b3IoKTsgfSk7XG4gICAgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlLnJlZ2lzdGVyRWRpdG9yKFwiYm9vbGVhblwiLCBmdW5jdGlvbiAoKTogU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlIHsgcmV0dXJuIG5ldyBTdXJ2ZXlCb29sZWFuUHJvcGVydHlFZGl0b3IoKTsgfSk7XG4gICAgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlLnJlZ2lzdGVyRWRpdG9yKFwibnVtYmVyXCIsIGZ1bmN0aW9uICgpOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UgeyByZXR1cm4gbmV3IFN1cnZleU51bWJlclByb3BlcnR5RWRpdG9yKCk7IH0pO1xufSIsIi8qIVxuKiBzdXJ2ZXlqcyBFZGl0b3IgdjAuOS4xMlxuKiAoYykgQW5kcmV3IFRlbG5vdiAtIGh0dHA6Ly9zdXJ2ZXlqcy5vcmcvYnVpbGRlci9cbiogR2l0aHViIC0gaHR0cHM6Ly9naXRodWIuY29tL2FuZHJld3RlbG5vdi9zdXJ2ZXkuanMuZWRpdG9yXG4qL1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlFZGl0b3JzL3Byb3BlcnR5RWRpdG9yQmFzZS50c1wiIC8+XG5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuXG4gICAgZXhwb3J0IGRlY2xhcmUgdHlwZSBTdXJ2ZXlPblByb3BlcnR5Q2hhbmdlZENhbGxiYWNrID0gKHByb3BlcnR5OiBTdXJ2ZXlPYmplY3RQcm9wZXJ0eSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlPYmplY3RQcm9wZXJ0eSB7XG4gICAgICAgIHByaXZhdGUgb2JqZWN0VmFsdWU6IGFueTtcbiAgICAgICAgcHJpdmF0ZSBpc1ZhbHVlVXBkYXRpbmc6IGJvb2xlYW47XG4gICAgICAgIHByaXZhdGUgb25Qcm9wZXJ0eUNoYW5nZWQ6IFN1cnZleU9uUHJvcGVydHlDaGFuZ2VkQ2FsbGJhY2s7XG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgICAgIHB1YmxpYyBkaXNwbGF5TmFtZTogc3RyaW5nO1xuICAgICAgICBwdWJsaWMgdGl0bGU6IHN0cmluZztcbiAgICAgICAgcHVibGljIGtvVmFsdWU6IGFueTtcbiAgICAgICAgcHVibGljIGtvVGV4dDogYW55O1xuICAgICAgICBwdWJsaWMgbW9kYWxOYW1lOiBzdHJpbmc7IFxuICAgICAgICBwdWJsaWMgbW9kYWxOYW1lVGFyZ2V0OiBzdHJpbmc7XG4gICAgICAgIHB1YmxpYyBrb0lzRGVmYXVsdDogYW55O1xuICAgICAgICBwdWJsaWMgZWRpdG9yOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2U7XG4gICAgICAgIHB1YmxpYyBlZGl0b3JUeXBlOiBzdHJpbmc7XG4gICAgICAgIHB1YmxpYyBiYXNlRWRpdG9yVHlwZTogc3RyaW5nO1xuICAgICAgICBwdWJsaWMgY2hvaWNlczogQXJyYXk8YW55PjtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvcGVydHk6IFN1cnZleS5Kc29uT2JqZWN0UHJvcGVydHksIG9uUHJvcGVydHlDaGFuZ2VkOiBTdXJ2ZXlPblByb3BlcnR5Q2hhbmdlZENhbGxiYWNrID0gbnVsbCwgcHJvcGVydHlFZGl0b3JPcHRpb25zOiBhbnkgPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9uUHJvcGVydHlDaGFuZ2VkID0gb25Qcm9wZXJ0eUNoYW5nZWQ7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSB0aGlzLnByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgICB0aGlzLmtvVmFsdWUgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgICAgICB0aGlzLmNob2ljZXMgPSBwcm9wZXJ0eS5jaG9pY2VzO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3JUeXBlID0gcHJvcGVydHkudHlwZTtcbiAgICAgICAgICAgIC8vVE9ET1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hvaWNlcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JUeXBlID0gXCJkcm9wZG93blwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9uSXRlbUNoYW5nZWQgPSBmdW5jdGlvbiAobmV3VmFsdWU6IGFueSkgeyBzZWxmLm9uQXBwbHlFZGl0b3JWYWx1ZShuZXdWYWx1ZSk7IH07XG4gICAgICAgICAgICB0aGlzLmVkaXRvciA9IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZS5jcmVhdGVFZGl0b3IodGhpcy5lZGl0b3JUeXBlLCBvbkl0ZW1DaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLm9wdGlvbnMgPSBwcm9wZXJ0eUVkaXRvck9wdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmVkaXRvclR5cGUgPSB0aGlzLmVkaXRvci5lZGl0b3JUeXBlO1xuICAgICAgICAgICAgdGhpcy5tb2RhbE5hbWUgPSBcIm1vZGVsRWRpdG9yXCIgKyB0aGlzLmVkaXRvclR5cGUgKyB0aGlzLm5hbWU7XG4gICAgICAgICAgICB0aGlzLm1vZGFsTmFtZVRhcmdldCA9IFwiI1wiICsgdGhpcy5tb2RhbE5hbWU7XG4gICAgICAgICAgICB0aGlzLmtvVmFsdWUuc3Vic2NyaWJlKGZ1bmN0aW9uIChuZXdWYWx1ZSkgeyBzZWxmLm9ua29WYWx1ZUNoYW5nZWQobmV3VmFsdWUpOyB9KTtcbiAgICAgICAgICAgIHRoaXMua29UZXh0ID0ga28uY29tcHV0ZWQoKCkgPT4geyByZXR1cm4gc2VsZi5nZXRWYWx1ZVRleHQoc2VsZi5rb1ZhbHVlKCkpOyB9KTtcbiAgICAgICAgICAgIHRoaXMua29Jc0RlZmF1bHQgPSBrby5jb21wdXRlZChmdW5jdGlvbiAoKSB7IHJldHVybiBzZWxmLnByb3BlcnR5LmlzRGVmYXVsdFZhbHVlKHNlbGYua29WYWx1ZSgpKTsgfSk7IFxuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgb2JqZWN0KCk6IGFueSB7IHJldHVybiB0aGlzLm9iamVjdFZhbHVlOyB9XG4gICAgICAgIHB1YmxpYyBzZXQgb2JqZWN0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMub2JqZWN0VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmFsdWUoKTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgdXBkYXRlVmFsdWUoKSB7XG4gICAgICAgICAgICB0aGlzLmlzVmFsdWVVcGRhdGluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmtvVmFsdWUodGhpcy5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldE9iamVjdCh0aGlzLm9iamVjdCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRUaXRsZShlZGl0b3JMb2NhbGl6YXRpb24uZ2V0U3RyaW5nKFwicGUuZWRpdFByb3BlcnR5XCIpW1wiZm9ybWF0XCJdKHRoaXMucHJvcGVydHkubmFtZSkpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFZGl0b3JEYXRhKHRoaXMua29WYWx1ZSgpKTtcbiAgICAgICAgICAgIHRoaXMuaXNWYWx1ZVVwZGF0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBpc0FwcGx5aW5nTmV3VmFsdWU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBvbkFwcGx5RWRpdG9yVmFsdWUobmV3VmFsdWU6IGFueSkge1xuICAgICAgICAgICAgdGhpcy5pc0FwcGx5aW5nTmV3VmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5rb1ZhbHVlKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuaXNBcHBseWluZ05ld1ZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBvbmtvVmFsdWVDaGFuZ2VkKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0FwcGx5aW5nTmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUVkaXRvckRhdGEobmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub2JqZWN0ID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLm9iamVjdFt0aGlzLm5hbWVdID09IG5ld1ZhbHVlKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5vblByb3BlcnR5Q2hhbmdlZCAhPSBudWxsICYmICF0aGlzLmlzVmFsdWVVcGRhdGluZykgdGhpcy5vblByb3BlcnR5Q2hhbmdlZCh0aGlzLCBuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVFZGl0b3JEYXRhKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGdldFZhbHVlKCk6IGFueSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wZXJ0eS5oYXNUb1VzZUdldFZhbHVlKSByZXR1cm4gdGhpcy5wcm9wZXJ0eS5nZXRWYWx1ZSh0aGlzLm9iamVjdCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RbdGhpcy5uYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgZ2V0VmFsdWVUZXh0KHZhbHVlOiBhbnkpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0VmFsdWVUZXh0KHZhbHVlKTsgfVxuICAgIH1cbn0iLCIvKiFcbiogc3VydmV5anMgRWRpdG9yIHYwLjkuMTJcbiogKGMpIEFuZHJldyBUZWxub3YgLSBodHRwOi8vc3VydmV5anMub3JnL2J1aWxkZXIvXG4qIEdpdGh1YiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXd0ZWxub3Yvc3VydmV5LmpzLmVkaXRvclxuKi9cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm9iamVjdFByb3BlcnR5LnRzXCIgLz5cblxubW9kdWxlIFN1cnZleUVkaXRvciB7XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleU9iamVjdEVkaXRvciB7XG4gICAgICAgIHByaXZhdGUgc2VsZWN0ZWRPYmplY3RWYWx1ZTogYW55O1xuICAgICAgICBwdWJsaWMgcHJvcGVydHlFZGl0b3JPcHRpb25zOiBhbnkgPSBudWxsO1xuICAgICAgICBwdWJsaWMga29Qcm9wZXJ0aWVzOiBhbnk7XG4gICAgICAgIHB1YmxpYyBrb0FjdGl2ZVByb3BlcnR5OiBhbnk7XG4gICAgICAgIHB1YmxpYyBrb0hhc09iamVjdDogYW55O1xuICAgICAgICBwdWJsaWMgb25Qcm9wZXJ0eVZhbHVlQ2hhbmdlZDogU3VydmV5LkV2ZW50PChzZW5kZXI6IFN1cnZleU9iamVjdEVkaXRvciwgb3B0aW9uczogYW55KSA9PiBhbnksIGFueT4gPSBuZXcgU3VydmV5LkV2ZW50PChzZW5kZXI6IFN1cnZleU9iamVjdEVkaXRvciwgb3B0aW9uczogYW55KSA9PiBhbnksIGFueT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eUVkaXRvck9wdGlvbnM6IGFueSA9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlFZGl0b3JPcHRpb25zID0gcHJvcGVydHlFZGl0b3JPcHRpb25zO1xuICAgICAgICAgICAgdGhpcy5rb1Byb3BlcnRpZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMua29BY3RpdmVQcm9wZXJ0eSA9IGtvLm9ic2VydmFibGUoKTtcbiAgICAgICAgICAgIHRoaXMua29IYXNPYmplY3QgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBzZWxlY3RlZE9iamVjdCgpOiBhbnkgeyByZXR1cm4gdGhpcy5zZWxlY3RlZE9iamVjdFZhbHVlOyB9XG4gICAgICAgIHB1YmxpYyBzZXQgc2VsZWN0ZWRPYmplY3QodmFsdWU6IGFueSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRPYmplY3RWYWx1ZSA9PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5rb0hhc09iamVjdCh2YWx1ZSAhPSBudWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRPYmplY3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb3BlcnRpZXNPYmplY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0UHJvcGVydHlFZGl0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydGllcyA9IHRoaXMua29Qcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lID09IG5hbWUpIHJldHVybiBwcm9wZXJ0aWVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGNoYW5nZUFjdGl2ZVByb3BlcnR5KHByb3BlcnR5OiBTdXJ2ZXlPYmplY3RQcm9wZXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5rb0FjdGl2ZVByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgT2JqZWN0Q2hhbmdlZCgpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvcGVydGllc09iamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCB1cGRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkT2JqZWN0IHx8ICF0aGlzLnNlbGVjdGVkT2JqZWN0LmdldFR5cGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtvUHJvcGVydGllcyhbXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5rb0FjdGl2ZVByb3BlcnR5KG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwcm9wZXJ0aWVzID0gU3VydmV5Lkpzb25PYmplY3QubWV0YURhdGEuZ2V0UHJvcGVydGllcyh0aGlzLnNlbGVjdGVkT2JqZWN0LmdldFR5cGUoKSk7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYS5uYW1lID09IGIubmFtZSkgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgaWYgKGEubmFtZSA+IGIubmFtZSkgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgb2JqZWN0UHJvcGVydGllcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHByb3BFdmVudCA9IChwcm9wZXJ0eTogU3VydmV5T2JqZWN0UHJvcGVydHksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uUHJvcGVydHlWYWx1ZUNoYW5nZWQuZmlyZSh0aGlzLCB7IHByb3BlcnR5OiBwcm9wZXJ0eS5wcm9wZXJ0eSwgb2JqZWN0OiBwcm9wZXJ0eS5vYmplY3QsIG5ld1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FuU2hvd1Byb3BlcnR5KHByb3BlcnRpZXNbaV0pKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB2YXIgb2JqZWN0UHJvcGVydHkgPSBuZXcgU3VydmV5T2JqZWN0UHJvcGVydHkocHJvcGVydGllc1tpXSwgcHJvcEV2ZW50LCB0aGlzLnByb3BlcnR5RWRpdG9yT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdmFyIGxvY05hbWUgPSB0aGlzLnNlbGVjdGVkT2JqZWN0LmdldFR5cGUoKSArICdfJyArIHByb3BlcnRpZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICBvYmplY3RQcm9wZXJ0eS5kaXNwbGF5TmFtZSA9IGVkaXRvckxvY2FsaXphdGlvbi5nZXRQcm9wZXJ0eU5hbWUobG9jTmFtZSk7XG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gZWRpdG9yTG9jYWxpemF0aW9uLmdldFByb3BlcnR5VGl0bGUobG9jTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aXRsZSkgdGl0bGUgPSBvYmplY3RQcm9wZXJ0eS5kaXNwbGF5TmFtZTtcbiAgICAgICAgICAgICAgICBvYmplY3RQcm9wZXJ0eS50aXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgICAgIG9iamVjdFByb3BlcnRpZXMucHVzaChvYmplY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmtvUHJvcGVydGllcyhvYmplY3RQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIHRoaXMua29BY3RpdmVQcm9wZXJ0eSh0aGlzLmdldFByb3BlcnR5RWRpdG9yKFwibmFtZVwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGNhblNob3dQcm9wZXJ0eShwcm9wZXJ0eTogU3VydmV5Lkpzb25PYmplY3RQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBwcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gJ3F1ZXN0aW9ucycgfHwgbmFtZSA9PSAncGFnZXMnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgdXBkYXRlUHJvcGVydGllc09iamVjdCgpIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0aWVzID0gdGhpcy5rb1Byb3BlcnRpZXMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbaV0ub2JqZWN0ID0gdGhpcy5zZWxlY3RlZE9iamVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIvKiFcbiogc3VydmV5anMgRWRpdG9yIHYwLjkuMTJcbiogKGMpIEFuZHJldyBUZWxub3YgLSBodHRwOi8vc3VydmV5anMub3JnL2J1aWxkZXIvXG4qIEdpdGh1YiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXd0ZWxub3Yvc3VydmV5LmpzLmVkaXRvclxuKi9cblxuXG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgZGVjbGFyZSB0eXBlIFN1cnZleUFkZE5ld1BhZ2VDYWxsYmFjayA9ICgpID0+IHZvaWQ7XG4gICAgZXhwb3J0IGRlY2xhcmUgdHlwZSBTdXJ2ZXlTZWxlY3RQYWdlQ2FsbGJhY2sgPSAocGFnZTogU3VydmV5LlBhZ2UpID0+IHZvaWQ7XG4gICAgZXhwb3J0IGRlY2xhcmUgdHlwZSBTdXJ2ZXlNb3ZlUGFnZUNhbGxiYWNrID0gKGluZGV4RnJvbTogbnVtYmVyLCBpbmRleFRvOiBudW1iZXIpID0+IHZvaWQ7XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleVBhZ2VzRWRpdG9yIHtcbiAgICAgICAgc3VydmV5VmFsdWU6IFN1cnZleS5TdXJ2ZXk7XG4gICAgICAgIGtvUGFnZXM6IGFueTtcbiAgICAgICAga29Jc1ZhbGlkOiBhbnk7XG4gICAgICAgIHNlbGVjdFBhZ2VDbGljazogYW55O1xuICAgICAgICBvbkFkZE5ld1BhZ2VDYWxsYmFjazogU3VydmV5QWRkTmV3UGFnZUNhbGxiYWNrO1xuICAgICAgICBvblNlbGVjdFBhZ2VDYWxsYmFjazogU3VydmV5U2VsZWN0UGFnZUNhbGxiYWNrO1xuICAgICAgICBvbkRlbGV0ZVBhZ2VDYWxsYmFjazogU3VydmV5U2VsZWN0UGFnZUNhbGxiYWNrO1xuICAgICAgICBvbk1vdmVQYWdlQ2FsbGJhY2s6IFN1cnZleU1vdmVQYWdlQ2FsbGJhY2s7XG4gICAgICAgIGRyYWdnaW5nUGFnZTogYW55ID0gbnVsbDtcbiAgICAgICAgZHJhZ1N0YXJ0OiBhbnk7IGRyYWdPdmVyOiBhbnk7IGRyYWdFbmQ6IGFueTsgZHJhZ0Ryb3A6IGFueTsga2V5RG93bjogYW55O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG9uQWRkTmV3UGFnZUNhbGxiYWNrOiBTdXJ2ZXlBZGROZXdQYWdlQ2FsbGJhY2sgPSBudWxsLCBvblNlbGVjdFBhZ2VDYWxsYmFjazogU3VydmV5U2VsZWN0UGFnZUNhbGxiYWNrID0gbnVsbCxcbiAgICAgICAgICAgIG9uTW92ZVBhZ2VDYWxsYmFjazogU3VydmV5TW92ZVBhZ2VDYWxsYmFjayA9IG51bGwsIG9uRGVsZXRlUGFnZUNhbGxiYWNrOiBTdXJ2ZXlTZWxlY3RQYWdlQ2FsbGJhY2sgPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmtvUGFnZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMua29Jc1ZhbGlkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLm9uQWRkTmV3UGFnZUNhbGxiYWNrID0gb25BZGROZXdQYWdlQ2FsbGJhY2s7XG4gICAgICAgICAgICB0aGlzLm9uU2VsZWN0UGFnZUNhbGxiYWNrID0gb25TZWxlY3RQYWdlQ2FsbGJhY2s7XG4gICAgICAgICAgICB0aGlzLm9uTW92ZVBhZ2VDYWxsYmFjayA9IG9uTW92ZVBhZ2VDYWxsYmFjaztcbiAgICAgICAgICAgIHRoaXMub25EZWxldGVQYWdlQ2FsbGJhY2sgPSBvbkRlbGV0ZVBhZ2VDYWxsYmFjaztcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGFnZUNsaWNrID0gZnVuY3Rpb24ocGFnZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vblNlbGVjdFBhZ2VDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uU2VsZWN0UGFnZUNhbGxiYWNrKHBhZ2VJdGVtLnBhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMua2V5RG93biA9IGZ1bmN0aW9uIChlbDogYW55LCBlOiBLZXlib2FyZEV2ZW50KSB7IHNlbGYub25LZXlEb3duKGVsLCBlKTsgfVxuICAgICAgICAgICAgdGhpcy5kcmFnU3RhcnQgPSBmdW5jdGlvbiAoZWw6IGFueSkgeyBzZWxmLmRyYWdnaW5nUGFnZSA9IGVsOyB9O1xuICAgICAgICAgICAgdGhpcy5kcmFnT3ZlciA9IGZ1bmN0aW9uIChlbDogYW55KSB7ICB9O1xuICAgICAgICAgICAgdGhpcy5kcmFnRW5kID0gZnVuY3Rpb24gKCkgeyBzZWxmLmRyYWdnaW5nUGFnZSA9IG51bGw7IH07XG4gICAgICAgICAgICB0aGlzLmRyYWdEcm9wID0gZnVuY3Rpb24gKGVsOiBhbnkpIHsgc2VsZi5tb3ZlRHJhZ2dpbmdQYWdlVG8oZWwpOyB9O1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgc3VydmV5KCk6IFN1cnZleS5TdXJ2ZXkgeyByZXR1cm4gdGhpcy5zdXJ2ZXlWYWx1ZTsgfVxuICAgICAgICBwdWJsaWMgc2V0IHN1cnZleSh2YWx1ZTogU3VydmV5LlN1cnZleSkge1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5rb0lzVmFsaWQodGhpcy5zdXJ2ZXlWYWx1ZSAhPSBudWxsKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGFnZXMoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc2V0U2VsZWN0ZWRQYWdlKHBhZ2U6IFN1cnZleS5QYWdlKSB7XG4gICAgICAgICAgICB2YXIgcGFnZXMgPSB0aGlzLmtvUGFnZXMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwYWdlc1tpXS5rb1NlbGVjdGVkKHBhZ2VzW2ldLnBhZ2UgPT0gcGFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGFkZE5ld1BhZ2VDbGljaygpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9uQWRkTmV3UGFnZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkFkZE5ld1BhZ2VDYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyByZW1vdmVQYWdlKHBhZ2U6IFN1cnZleS5QYWdlKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmdldEluZGV4QnlQYWdlKHBhZ2UpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtvUGFnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgY2hhbmdlTmFtZShwYWdlOiBTdXJ2ZXkuUGFnZSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5nZXRJbmRleEJ5UGFnZShwYWdlKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rb1BhZ2VzKClbaW5kZXhdLnRpdGxlKFN1cnZleUhlbHBlci5nZXRPYmplY3ROYW1lKHBhZ2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgZ2V0SW5kZXhCeVBhZ2UocGFnZTogU3VydmV5LlBhZ2UpOiBudW1iZXIge1xuICAgICAgICAgICAgdmFyIHBhZ2VzID0gdGhpcy5rb1BhZ2VzKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhZ2VzW2ldLnBhZ2UgPT0gcGFnZSkgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIG9uS2V5RG93bihlbDogYW55LCBlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5rb1BhZ2VzKCkubGVuZ3RoIDw9IDEpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBwYWdlcyA9IHRoaXMua29QYWdlcygpO1xuICAgICAgICAgICAgdmFyIHBhZ2VJbmRleCA9IC0xO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwYWdlc1tpXS5wYWdlICYmIHBhZ2VzW2ldLmtvU2VsZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBwYWdlSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYWdlSW5kZXggPCAwKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDQ2ICYmIHRoaXMub25EZWxldGVQYWdlQ2FsbGJhY2spIHRoaXMub25EZWxldGVQYWdlQ2FsbGJhY2soZWwucGFnZSk7XG4gICAgICAgICAgICBpZiAoKGUua2V5Q29kZSA9PSAzNyB8fCBlLmtleUNvZGUgPT0gMzkpICYmIHRoaXMub25TZWxlY3RQYWdlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBwYWdlSW5kZXggKz0gKGUua2V5Q29kZSA9PSAzNyA/IC0xIDogMSk7XG4gICAgICAgICAgICAgICAgaWYgKHBhZ2VJbmRleCA8IDApIHBhZ2VJbmRleCA9IHBhZ2VzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHBhZ2VJbmRleCA+PSBwYWdlcy5sZW5ndGgpIHBhZ2VJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHBhZ2UgPSBwYWdlc1twYWdlSW5kZXhdLnBhZ2U7XG4gICAgICAgICAgICAgICAgdGhpcy5vblNlbGVjdFBhZ2VDYWxsYmFjayhwYWdlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGVjdGVkUGFnZShwYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgdXBkYXRlUGFnZXMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdXJ2ZXlWYWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rb1BhZ2VzKFtdKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGFnZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdXJ2ZXlWYWx1ZS5wYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5zdXJ2ZXlWYWx1ZS5wYWdlc1tpXTtcbiAgICAgICAgICAgICAgICBwYWdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGtvLm9ic2VydmFibGUoU3VydmV5SGVscGVyLmdldE9iamVjdE5hbWUocGFnZSkpLCBwYWdlOiBwYWdlLCBrb1NlbGVjdGVkOiBrby5vYnNlcnZhYmxlKGZhbHNlKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5rb1BhZ2VzKHBhZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIG1vdmVEcmFnZ2luZ1BhZ2VUbyh0b1BhZ2U6IGFueSkge1xuICAgICAgICAgICAgaWYgKHRvUGFnZSA9PSBudWxsIHx8IHRvUGFnZSA9PSB0aGlzLmRyYWdnaW5nUGFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQYWdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BhZ2UgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rb1BhZ2VzKCkuaW5kZXhPZih0aGlzLmRyYWdnaW5nUGFnZSk7XG4gICAgICAgICAgICB2YXIgaW5kZXhUbyA9IHRoaXMua29QYWdlcygpLmluZGV4T2YodG9QYWdlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9uTW92ZVBhZ2VDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlUGFnZUNhbGxiYWNrKGluZGV4LCBpbmRleFRvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIvKiFcbiogc3VydmV5anMgRWRpdG9yIHYwLjkuMTJcbiogKGMpIEFuZHJldyBUZWxub3YgLSBodHRwOi8vc3VydmV5anMub3JnL2J1aWxkZXIvXG4qIEdpdGh1YiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXd0ZWxub3Yvc3VydmV5LmpzLmVkaXRvclxuKi9cblxubW9kdWxlIFN1cnZleUVkaXRvciB7XG4gICAgY2xhc3MgVGV4dFBhcnNlclByb3Blcnkge1xuICAgICAgICBpc0ZvdW5kOiBib29sZWFuO1xuICAgICAgICBwcm9wZXJ0aWVzQ291bnQ6IG51bWJlcjtcbiAgICAgICAgc3RhcnQ6IG51bWJlcjtcbiAgICAgICAgZW5kOiBudW1iZXI7XG4gICAgICAgIHZhbHVlU3RhcnQ6IG51bWJlcjtcbiAgICAgICAgdmFsdWVFbmQ6IG51bWJlcjtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5VGV4dFdvcmtlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbmV3TGluZUNoYXI6IHN0cmluZztcbiAgICAgICAgcHVibGljIGVycm9yczogQXJyYXk8YW55PjtcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlWYWx1ZTogU3VydmV5LlN1cnZleTtcbiAgICAgICAgcHJpdmF0ZSBqc29uVmFsdWU6IGFueTtcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlPYmplY3RzOiBBcnJheTxhbnk+O1xuICAgICAgICBwcml2YXRlIGlzU3VydmV5QXNQYWdlOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy50ZXh0IHx8IHRoaXMudGV4dC50cmltKCkgPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dCA9IFwie31cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3MoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IHN1cnZleSgpOiBTdXJ2ZXkuU3VydmV5IHsgcmV0dXJuIHRoaXMuc3VydmV5VmFsdWU7IH1cbiAgICAgICAgcHVibGljIGdldCBpc0pzb25Db3JyZWN0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5zdXJ2ZXlWYWx1ZSAhPSBudWxsOyB9XG4gICAgICAgIHByb3RlY3RlZCBwcm9jZXNzKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmpzb25WYWx1ZSA9IG5ldyBTdXJ2ZXlKU09ONSgxKS5wYXJzZSh0aGlzLnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7IHBvczogeyBzdGFydDogZXJyb3IuYXQsIGVuZDogLTEgfSwgdGV4dDogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmpzb25WYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVKc29uUG9zaXRpb25zKHRoaXMuanNvblZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cnZleVZhbHVlID0gbmV3IFN1cnZleS5TdXJ2ZXkodGhpcy5qc29uVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN1cnZleVZhbHVlLmpzb25FcnJvcnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3VydmV5VmFsdWUuanNvbkVycm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVycm9yID0gdGhpcy5zdXJ2ZXlWYWx1ZS5qc29uRXJyb3JzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7IHBvczogeyBzdGFydDogZXJyb3IuYXQsIGVuZDogLTEgfSwgdGV4dDogZXJyb3IuZ2V0RnVsbERlc2NyaXB0aW9uKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnN1cnZleU9iamVjdHMgPSB0aGlzLmNyZWF0ZVN1cnZleU9iamVjdHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RWRpdG9yUG9zaXRpb25CeUNoYXJ0QXQodGhpcy5zdXJ2ZXlPYmplY3RzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RWRpdG9yUG9zaXRpb25CeUNoYXJ0QXQodGhpcy5lcnJvcnMpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgdXBkYXRlSnNvblBvc2l0aW9ucyhqc29uT2JqOiBhbnkpIHtcbiAgICAgICAgICAgIGpzb25PYmpbXCJwb3NcIl1bXCJzZWxmXCJdID0ganNvbk9iajtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBqc29uT2JqKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGpzb25PYmpba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAob2JqICYmIG9ialtcInBvc1wiXSkge1xuICAgICAgICAgICAgICAgICAgICBqc29uT2JqW1wicG9zXCJdW2tleV0gPSBvYmpbXCJwb3NcIl07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSnNvblBvc2l0aW9ucyhvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGNyZWF0ZVN1cnZleU9iamVjdHMoKTogQXJyYXk8YW55PiB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5zdXJ2ZXlWYWx1ZSA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgdGhpcy5pc1N1cnZleUFzUGFnZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1cnZleVZhbHVlLnBhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLnN1cnZleVZhbHVlLnBhZ2VzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChpID09IDAgJiYgIXBhZ2VbXCJwb3NcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZVtcInBvc1wiXSA9IHRoaXMuc3VydmV5VmFsdWVbXCJwb3NcIl07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTdXJ2ZXlBc1BhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChwYWdlKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhZ2UucXVlc3Rpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHBhZ2UucXVlc3Rpb25zW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgc2V0RWRpdG9yUG9zaXRpb25CeUNoYXJ0QXQob2JqZWN0czogYW55W10pIHtcbiAgICAgICAgICAgIGlmIChvYmplY3RzID09IG51bGwgfHwgb2JqZWN0cy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0geyByb3c6IDAsIGNvbHVtbjogMCB9O1xuICAgICAgICAgICAgdmFyIGF0T2JqZWN0c0FycmF5ID0gdGhpcy5nZXRBdEFycmF5KG9iamVjdHMpO1xuICAgICAgICAgICAgdmFyIHN0YXJ0QXQ6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0T2JqZWN0c0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0ID0gYXRPYmplY3RzQXJyYXlbaV0uYXQ7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLmdldFBvc3Rpb25CeUNoYXJ0QXQocG9zaXRpb24sIHN0YXJ0QXQsIGF0KTtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gYXRPYmplY3RzQXJyYXlbaV0ub2JqO1xuICAgICAgICAgICAgICAgIGlmICghb2JqLnBvc2l0aW9uKSBvYmoucG9zaXRpb24gPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoYXQgPT0gb2JqLnBvcy5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBvYmoucG9zaXRpb24uc3RhcnQgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXQgPT0gb2JqLnBvcy5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iai5wb3NpdGlvbi5lbmQgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGFydEF0ID0gYXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRQb3N0aW9uQnlDaGFydEF0KHN0YXJ0UG9zaXRpb246IEFjZUFqYXguUG9zaXRpb24sIHN0YXJ0QXQ6IG51bWJlciwgYXQ6IG51bWJlcik6IGFueSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0geyByb3c6IHN0YXJ0UG9zaXRpb24ucm93LCBjb2x1bW46IHN0YXJ0UG9zaXRpb24uY29sdW1uIH07XG4gICAgICAgICAgICB2YXIgY3VyQ2hhciA9IHN0YXJ0QXQ7XG4gICAgICAgICAgICB3aGlsZSAoY3VyQ2hhciA8IGF0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGV4dC5jaGFyQXQoY3VyQ2hhcikgPT0gU3VydmV5VGV4dFdvcmtlci5uZXdMaW5lQ2hhcikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm93Kys7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jb2x1bW4gPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jb2x1bW4rKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VyQ2hhcisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldEF0QXJyYXkob2JqZWN0czogYW55W10pOiBhbnlbXSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gb2JqZWN0c1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcG9zID0gb2JqLnBvcztcbiAgICAgICAgICAgICAgICBpZiAoIXBvcykgY29udGludWU7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goeyBhdDogcG9zLnN0YXJ0LCBvYmo6IG9iaiB9KTtcbiAgICAgICAgICAgICAgICBpZiAocG9zLmVuZCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goeyBhdDogcG9zLmVuZCwgb2JqOiBvYmogfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zb3J0KChlbDEsIGVsMikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlbDEuYXQgPiBlbDIuYXQpIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIGlmIChlbDEuYXQgPCBlbDIuYXQpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSIsIi8qIVxuKiBzdXJ2ZXlqcyBFZGl0b3IgdjAuOS4xMlxuKiAoYykgQW5kcmV3IFRlbG5vdiAtIGh0dHA6Ly9zdXJ2ZXlqcy5vcmcvYnVpbGRlci9cbiogR2l0aHViIC0gaHR0cHM6Ly9naXRodWIuY29tL2FuZHJld3RlbG5vdi9zdXJ2ZXkuanMuZWRpdG9yXG4qL1xuXG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgZW51bSBPYmpUeXBlIHsgVW5rbm93biwgU3VydmV5LCBQYWdlLCBRdWVzdGlvbiB9XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleUhlbHBlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0TmV3UGFnZU5hbWUob2JqczogQXJyYXk8YW55Pikge1xuICAgICAgICAgICAgcmV0dXJuIFN1cnZleUhlbHBlci5nZXROZXdOYW1lKG9ianMsIGVkaXRvckxvY2FsaXphdGlvbi5nZXRTdHJpbmcoXCJlZC5uZXdQYWdlTmFtZVwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXROZXdRdWVzdGlvbk5hbWUob2JqczogQXJyYXk8YW55Pikge1xuICAgICAgICAgICAgcmV0dXJuIFN1cnZleUhlbHBlci5nZXROZXdOYW1lKG9ianMsIGVkaXRvckxvY2FsaXphdGlvbi5nZXRTdHJpbmcoXCJlZC5uZXdRdWVzdGlvbk5hbWVcIikpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0TmV3TmFtZShvYmpzOiBBcnJheTxhbnk+LCBiYXNlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHZhciBoYXNoID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBoYXNoW29ianNbaV0ubmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG51bSA9IDE7XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFzaFtiYXNlTmFtZSArIG51bS50b1N0cmluZygpXSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmFzZU5hbWUgKyBudW0udG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldE9iamVjdFR5cGUob2JqOiBhbnkpOiBPYmpUeXBlIHtcbiAgICAgICAgICAgIGlmICghb2JqIHx8ICFvYmpbXCJnZXRUeXBlXCJdKSByZXR1cm4gT2JqVHlwZS5Vbmtub3duO1xuICAgICAgICAgICAgaWYgKG9iai5nZXRUeXBlKCkgPT0gXCJwYWdlXCIpIHJldHVybiBPYmpUeXBlLlBhZ2U7XG4gICAgICAgICAgICBpZiAob2JqLmdldFR5cGUoKSA9PSBcInN1cnZleVwiKSByZXR1cm4gT2JqVHlwZS5TdXJ2ZXk7XG4gICAgICAgICAgICBpZiAob2JqW1wibmFtZVwiXSkgcmV0dXJuIE9ialR5cGUuUXVlc3Rpb247XG4gICAgICAgICAgICByZXR1cm4gT2JqVHlwZS5Vbmtub3duO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0T2JqZWN0TmFtZShvYmo6IGFueSk6IHN0cmluZyB7XG4gICAgICAgICAgICBpZiAob2JqW1wibmFtZVwiXSkgcmV0dXJuIG9ialtcIm5hbWVcIl07XG4gICAgICAgICAgICB2YXIgb2JqVHlwZSA9IFN1cnZleUhlbHBlci5nZXRPYmplY3RUeXBlKG9iaik7XG4gICAgICAgICAgICBpZiAob2JqVHlwZSAhPSBPYmpUeXBlLlBhZ2UpIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSA8U3VydmV5LlN1cnZleT4oPFN1cnZleS5QYWdlPm9iaikuZGF0YTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGRhdGEucGFnZXMuaW5kZXhPZig8U3VydmV5LlBhZ2U+b2JqKTtcbiAgICAgICAgICAgIHJldHVybiBcIltQYWdlIFwiICsgKGluZGV4ICsgMSkgKyBcIl1cIjtcbiAgICAgICAgfVxuICAgIH1cbn0iLCIvKiFcbiogc3VydmV5anMgRWRpdG9yIHYwLjkuMTJcbiogKGMpIEFuZHJldyBUZWxub3YgLSBodHRwOi8vc3VydmV5anMub3JnL2J1aWxkZXIvXG4qIEdpdGh1YiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXd0ZWxub3Yvc3VydmV5LmpzLmVkaXRvclxuKi9cblxubW9kdWxlIFN1cnZleUVkaXRvciB7XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleUVtYmVkaW5nV2luZG93IHtcbiAgICAgICAgcHJpdmF0ZSBqc29uVmFsdWU6IGFueTtcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlFbWJlZGluZ0hlYWQ6IEFjZUFqYXguRWRpdG9yO1xuICAgICAgICBwcml2YXRlIHN1cnZleUVtYmVkaW5nSmF2YTogQWNlQWpheC5FZGl0b3I7XG4gICAgICAgIHB1YmxpYyBzdXJ2ZXlJZDogc3RyaW5nID0gbnVsbDtcbiAgICAgICAgcHVibGljIHN1cnZleVBvc3RJZDogc3RyaW5nID0gbnVsbDtcbiAgICAgICAgcHVibGljIGdlbmVyYXRlVmFsaWRKU09OOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGtvU2hvd0FzV2luZG93OiBhbnk7XG4gICAgICAgIGtvU2NyaXB0VXNpbmc6IGFueTtcbiAgICAgICAga29IYXNJZHM6IGFueTtcbiAgICAgICAga29Mb2FkU3VydmV5OiBhbnk7XG4gICAgICAgIGtvTGlicmFyeVZlcnNpb246IGFueTtcbiAgICAgICAga29WaXNpYmxlSHRtbDogYW55O1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMua29MaWJyYXJ5VmVyc2lvbiA9IGtvLm9ic2VydmFibGUoXCJrbm9ja291dFwiKTtcbiAgICAgICAgICAgIHRoaXMua29TaG93QXNXaW5kb3cgPSBrby5vYnNlcnZhYmxlKFwicGFnZVwiKTtcbiAgICAgICAgICAgIHRoaXMua29TY3JpcHRVc2luZyA9IGtvLm9ic2VydmFibGUoXCJib290c3RyYXBcIik7XG4gICAgICAgICAgICB0aGlzLmtvSGFzSWRzID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmtvTG9hZFN1cnZleSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5rb1Zpc2libGVIdG1sID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLmtvTGlicmFyeVZlcnNpb24oKSA9PSBcInJlYWN0XCIgfHwgc2VsZi5rb1Nob3dBc1dpbmRvdygpID09XCJwYWdlXCI7IH0pO1xuICAgICAgICAgICAgdGhpcy5rb0xpYnJhcnlWZXJzaW9uLnN1YnNjcmliZShmdW5jdGlvbiAobmV3VmFsdWUpIHsgc2VsZi5zZXRIZWFkVGV4dCgpOyBzZWxmLnN1cnZleUVtYmVkaW5nSmF2YS5zZXRWYWx1ZShzZWxmLmdldEphdmFUZXh0KCkpOyB9KTtcbiAgICAgICAgICAgIHRoaXMua29TaG93QXNXaW5kb3cuc3Vic2NyaWJlKGZ1bmN0aW9uIChuZXdWYWx1ZSkgeyBzZWxmLnN1cnZleUVtYmVkaW5nSmF2YS5zZXRWYWx1ZShzZWxmLmdldEphdmFUZXh0KCkpOyB9KTtcbiAgICAgICAgICAgIHRoaXMua29TY3JpcHRVc2luZy5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7IHNlbGYuc2V0SGVhZFRleHQoKTsgfSk7XG4gICAgICAgICAgICB0aGlzLmtvTG9hZFN1cnZleS5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7IHNlbGYuc3VydmV5RW1iZWRpbmdKYXZhLnNldFZhbHVlKHNlbGYuZ2V0SmF2YVRleHQoKSk7IH0pO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZ0hlYWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQganNvbigpOiBhbnkgeyByZXR1cm4gdGhpcy5qc29uVmFsdWU7IH1cbiAgICAgICAgcHVibGljIHNldCBqc29uKHZhbHVlOiBhbnkpIHsgdGhpcy5qc29uVmFsdWUgPSB2YWx1ZTsgfVxuICAgICAgICBwdWJsaWMgc2hvdygpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1cnZleUVtYmVkaW5nSGVhZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZ0hlYWQgPSB0aGlzLmNyZWF0ZUVkaXRvcihcInN1cnZleUVtYmVkaW5nSGVhZFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRUZXh0KCk7XG4gICAgICAgICAgICAgICAgdmFyIGJvZHlFZGl0b3IgPSB0aGlzLmNyZWF0ZUVkaXRvcihcInN1cnZleUVtYmVkaW5nQm9keVwiKTtcbiAgICAgICAgICAgICAgICBib2R5RWRpdG9yLnNldFZhbHVlKFwiPGRpdiBpZD0gXFxcIm15U3VydmV5SlNOYW1lXFxcIiA+PC9kaXY+XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5RW1iZWRpbmdKYXZhID0gdGhpcy5jcmVhdGVFZGl0b3IoXCJzdXJ2ZXlFbWJlZGluZ0phdmFcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmtvSGFzSWRzKHRoaXMuc3VydmV5SWQgJiYgdGhpcy5zdXJ2ZXlQb3N0SWQpO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZ0phdmEuc2V0VmFsdWUodGhpcy5nZXRKYXZhVGV4dCgpKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHNldEhlYWRUZXh0KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMua29MaWJyYXJ5VmVyc2lvbigpID09IFwia25vY2tvdXRcIikge1xuICAgICAgICAgICAgICAgIHZhciBrbm9ja291dFN0ciA9IFwiPHNjcmlwdCBzcmM9XFxcImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2tub2Nrb3V0LzMuMy4wL2tub2Nrb3V0LW1pbi5qc1xcXCIgPjwvc2NyaXB0PlxcblwiO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtvU2NyaXB0VXNpbmcoKSA9PSBcImJvb3RzdHJhcFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5RW1iZWRpbmdIZWFkLnNldFZhbHVlKGtub2Nrb3V0U3RyICsgXCI8c2NyaXB0IHNyYz1cXFwianMvc3VydmV5LmJvb3RzdHJhcC5taW4uanNcXFwiPjwvc2NyaXB0PlwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1cnZleUVtYmVkaW5nSGVhZC5zZXRWYWx1ZShrbm9ja291dFN0ciArIFwiPHNjcmlwdCBzcmM9XFxcImpzL3N1cnZleS5taW4uanNcXFwiPjwvc2NyaXB0PlxcbjxsaW5rIGhyZWY9XFxcImNzcy9zdXJ2ZXkuY3NzXFxcIiB0eXBlPVxcXCJ0ZXh0L2Nzc1xcXCIgcmVsPVxcXCJzdHlsZXNoZWV0XFxcIiAvPlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBrbm9ja291dFN0ciA9IFwiPHNjcmlwdCBzcmM9XFxcImh0dHBzOi8vZmIubWUvcmVhY3QtMC4xNC44LmpzXFxcIj48L3NjcmlwdD5cXG48c2NyaXB0IHNyYz0gXFxcImh0dHBzOi8vZmIubWUvcmVhY3QtZG9tLTAuMTQuOC5qc1xcXCI+PC9zY3JpcHQ+XFxuPHNjcmlwdCBzcmM9XFxcImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2JhYmVsLWNvcmUvNS44LjIzL2Jyb3dzZXIubWluLmpzXFxcIj48L3NjcmlwdD5cXG5cIjtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rb1NjcmlwdFVzaW5nKCkgPT0gXCJib290c3RyYXBcIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1cnZleUVtYmVkaW5nSGVhZC5zZXRWYWx1ZShrbm9ja291dFN0ciArIFwiPHNjcmlwdCBzcmM9XFxcImpzL3N1cnZleS5yZWFjdC5ib290c3RyYXAubWluLmpzXFxcIj48L3NjcmlwdD5cIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZ0hlYWQuc2V0VmFsdWUoa25vY2tvdXRTdHIgKyBcIjxzY3JpcHQgc3JjPVxcXCJqcy9zdXJ2ZXkucmVhY3QubWluLmpzXFxcIj48L3NjcmlwdD5cXG48bGluayBocmVmPVxcXCJjc3Mvc3VydmV5LmNzc1xcXCIgdHlwZT1cXFwidGV4dC9jc3NcXFwiIHJlbD1cXFwic3R5bGVzaGVldFxcXCIgLz5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlRWRpdG9yKGVsZW1lbnROYW1lOiBzdHJpbmcpOiBBY2VBamF4LkVkaXRvciB7XG4gICAgICAgICAgICB2YXIgZWRpdG9yID0gYWNlLmVkaXQoZWxlbWVudE5hbWUpO1xuICAgICAgICAgICAgZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL21vbm9rYWlcIik7XG4gICAgICAgICAgICBlZGl0b3Iuc2Vzc2lvbi5zZXRNb2RlKFwiYWNlL21vZGUvanNvblwiKTtcbiAgICAgICAgICAgIGVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICAgICAgZWRpdG9yLnJlbmRlcmVyLnNldFNob3dHdXR0ZXIoZmFsc2UpO1xuICAgICAgICAgICAgZWRpdG9yLnNldFJlYWRPbmx5KHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIGVkaXRvcjtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldEphdmFUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgICAgICB2YXIgaXNPblBhZ2UgPSB0aGlzLmtvU2hvd0FzV2luZG93KCkgPT0gXCJwYWdlXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5rb0xpYnJhcnlWZXJzaW9uKCkgPT0gXCJrbm9ja291dFwiKSByZXR1cm4gdGhpcy5nZXRLbm9ja291dEphdmFUZXh0KGlzT25QYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFJlYWN0SmF2YVRleHQoaXNPblBhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0S25vY2tvdXRKYXZhVGV4dChpc09uUGFnZTogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGlzT25QYWdlID8gXCJ2YXIgc3VydmV5ID0gbmV3IFN1cnZleS5TdXJ2ZXkoXFxuXCIgOiBcInZhciBzdXJ2ZXlXaW5kb3cgPSBuZXcgU3VydmV5LlN1cnZleVdpbmRvdyhcXG5cIjtcbiAgICAgICAgICAgIHRleHQgKz0gdGhpcy5nZXRKc29uVGV4dCgpO1xuICAgICAgICAgICAgdGV4dCArPSBcIik7XFxuXCI7XG4gICAgICAgICAgICBpZiAoIWlzT25QYWdlKSB7XG4gICAgICAgICAgICAgICAgdGV4dCArPSBcInN1cnZleVdpbmRvdy5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzYXZlRnVuYyA9IHRoaXMuZ2V0U2F2ZUZ1bmNDb2RlKCk7XG4gICAgICAgICAgICB0ZXh0ICs9IFwic3VydmV5Lm9uQ29tcGxldGUuYWRkKGZ1bmN0aW9uIChzKSB7XFxuXCIgKyBzYXZlRnVuYyArIFwiXFxuIH0pO1xcblwiO1xuICAgICAgICAgICAgaWYgKGlzT25QYWdlKSB7XG4gICAgICAgICAgICAgICAgdGV4dCArPSBcInN1cnZleS5yZW5kZXIoXFxcIm15U3VydmV5SlNOYW1lXFxcIik7XCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRleHQgKz0gXCIvL0J5IGRlZmF1bHQgU3VydmV5LnRpdGxlIGlzIHVzZWQuXFxuXCJcbiAgICAgICAgICAgICAgICB0ZXh0ICs9IFwiLy9zdXJ2ZXlXaW5kb3cudGl0bGUgPSBcXFwiTXkgU3VydmV5IFdpbmRvdyBUaXRsZS5cXFwiO1xcblwiO1xuICAgICAgICAgICAgICAgIHRleHQgKz0gXCJzdXJ2ZXlXaW5kb3cuc2hvdygpO1wiO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldFJlYWN0SmF2YVRleHQoaXNPblBhZ2U6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgICAgICAgICAgdmFyIHNhdmVGdW5jID0gdGhpcy5nZXRTYXZlRnVuY0NvZGUoKTtcbiAgICAgICAgICAgIHZhciBzZW5kUmVzdWx0VGV4dCA9IFwidmFyIHN1cnZleVNlbmRSZXN1bHQgPSBmdW5jdGlvbiAocykge1xcblwiICsgc2F2ZUZ1bmMgKyBcIlxcbiB9KTtcXG5cIjtcbiAgICAgICAgICAgIHZhciBuYW1lID0gaXNPblBhZ2UgPyBcIlJlYWN0U3VydmV5XCIgOiBcIlJlYWN0U3VydmV5V2luZG93XCI7XG4gICAgICAgICAgICB2YXIganNvblRleHQgPSBcInZhciBzdXJ2ZXlKc29uID0gXCIgKyB0aGlzLmdldEpzb25UZXh0KCkgKyBcIlxcblxcblwiO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBqc29uVGV4dCArIHNlbmRSZXN1bHRUZXh0ICsgXCJSZWFjdERPTS5yZW5kZXIoXFxuPFwiICsgbmFtZSArIFwiIGpzb249e3N1cnZleUpzb259IG9uQ29tcGxldGU9e3N1cnZleVNlbmRSZXN1bHR9IC8+LCBcXG4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXFxcIm15U3VydmV5SlNOYW1lXFxcIikpO1wiO1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRTYXZlRnVuY0NvZGUoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5rb0hhc0lkcygpKSByZXR1cm4gXCJzdXJ2ZXkuc2VuZFJlc3VsdCgnXCIgKyB0aGlzLnN1cnZleVBvc3RJZCArIFwiJyk7XCI7XG4gICAgICAgICAgICByZXR1cm4gXCJhbGVydChcXFwiVGhlIHJlc3VsdHMgYXJlOlxcXCIgKyBKU09OLnN0cmluZ2lmeShzLmRhdGEpKTtcIjtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldEpzb25UZXh0KCk6IHN0cmluZyB7XG4gICAgICAgICAgICBpZiAodGhpcy5rb0hhc0lkcygpICYmIHRoaXMua29Mb2FkU3VydmV5KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ7IHN1cnZleUlkOiAnXCIgKyB0aGlzLnN1cnZleUlkICsgXCInfVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZ2VuZXJhdGVWYWxpZEpTT04pIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmpzb24pO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTdXJ2ZXlKU09ONSgpLnN0cmluZ2lmeSh0aGlzLmpzb24pO1xuICAgICAgICB9XG4gICAgfVxufSIsIi8qIVxuKiBzdXJ2ZXlqcyBFZGl0b3IgdjAuOS4xMlxuKiAoYykgQW5kcmV3IFRlbG5vdiAtIGh0dHA6Ly9zdXJ2ZXlqcy5vcmcvYnVpbGRlci9cbiogR2l0aHViIC0gaHR0cHM6Ly9naXRodWIuY29tL2FuZHJld3RlbG5vdi9zdXJ2ZXkuanMuZWRpdG9yXG4qL1xuXG4gICAgbW9kdWxlIFN1cnZleUVkaXRvciB7XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleVZlcmJzIHtcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlWYWx1ZTogU3VydmV5LlN1cnZleTtcbiAgICAgICAgcHJpdmF0ZSBvYmpWYWx1ZTogYW55O1xuICAgICAgICBwcml2YXRlIGNob2ljZXNDbGFzc2VzOiBBcnJheTxzdHJpbmc+O1xuICAgICAgICBrb1ZlcmJzOiBhbnk7XG4gICAgICAgIGtvSGFzVmVyYnM6IGFueTtcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIG9uTW9kaWZpZWRDYWxsYmFjazogKCkgPT4gYW55KSB7XG4gICAgICAgICAgICB0aGlzLmtvVmVyYnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMua29IYXNWZXJicyA9IGtvLm9ic2VydmFibGUoKTtcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gU3VydmV5Lkpzb25PYmplY3QubWV0YURhdGEuZ2V0Q2hpbGRyZW5DbGFzc2VzKFwic2VsZWN0YmFzZVwiLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuY2hvaWNlc0NsYXNzZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hvaWNlc0NsYXNzZXMucHVzaChjbGFzc2VzW2ldLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgc3VydmV5KCk6IFN1cnZleS5TdXJ2ZXkgeyByZXR1cm4gdGhpcy5zdXJ2ZXlWYWx1ZTsgfVxuICAgICAgICBwdWJsaWMgc2V0IHN1cnZleSh2YWx1ZTogU3VydmV5LlN1cnZleSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3VydmV5ID09IHZhbHVlKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnN1cnZleVZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBvYmooKTogYW55IHsgcmV0dXJuIHRoaXMub2JqVmFsdWUgfVxuICAgICAgICBwdWJsaWMgc2V0IG9iaih2YWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vYmpWYWx1ZSA9PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5vYmpWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5idWlsZFZlcmJzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBidWlsZFZlcmJzKCkge1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICB2YXIgb2JqVHlwZSA9IFN1cnZleUhlbHBlci5nZXRPYmplY3RUeXBlKHRoaXMub2JqKTtcbiAgICAgICAgICAgIGlmIChvYmpUeXBlID09IE9ialR5cGUuUXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSA8U3VydmV5LlF1ZXN0aW9uQmFzZT50aGlzLm9iajtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdXJ2ZXkucGFnZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKG5ldyBTdXJ2ZXlWZXJiQ2hhbmdlUGFnZUl0ZW0odGhpcy5zdXJ2ZXksIHF1ZXN0aW9uLCB0aGlzLm9uTW9kaWZpZWRDYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaG9pY2VzQ2xhc3Nlcy5pbmRleE9mKHF1ZXN0aW9uLmdldFR5cGUoKSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKG5ldyBTdXJ2ZXlWZXJiQ2hhbmdlVHlwZUl0ZW0odGhpcy5zdXJ2ZXksIHF1ZXN0aW9uLCB0aGlzLm9uTW9kaWZpZWRDYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMua29WZXJicyhhcnJheSk7XG4gICAgICAgICAgICB0aGlzLmtvSGFzVmVyYnMoYXJyYXkubGVuZ3RoID4gMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleVZlcmJJdGVtIHtcbiAgICAgICAga29JdGVtczogYW55O1xuICAgICAgICBrb1NlbGVjdGVkSXRlbTogYW55O1xuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgc3VydmV5OiBTdXJ2ZXkuU3VydmV5LCBwdWJsaWMgcXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkJhc2UsIHB1YmxpYyBvbk1vZGlmaWVkQ2FsbGJhY2s6ICgpID0+IGFueSkge1xuICAgICAgICAgICAgdGhpcy5rb0l0ZW1zID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWRJdGVtID0ga28ub2JzZXJ2YWJsZSgpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgdGV4dCgpOiBzdHJpbmcgeyByZXR1cm4gXCJcIjsgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5VmVyYkNoYW5nZVR5cGVJdGVtIGV4dGVuZHMgU3VydmV5VmVyYkl0ZW0ge1xuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgc3VydmV5OiBTdXJ2ZXkuU3VydmV5LCBwdWJsaWMgcXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkJhc2UsIHB1YmxpYyBvbk1vZGlmaWVkQ2FsbGJhY2s6ICgpID0+IGFueSkge1xuICAgICAgICAgICAgc3VwZXIoc3VydmV5LCBxdWVzdGlvbiwgb25Nb2RpZmllZENhbGxiYWNrKTtcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gU3VydmV5Lkpzb25PYmplY3QubWV0YURhdGEuZ2V0Q2hpbGRyZW5DbGFzc2VzKFwic2VsZWN0YmFzZVwiLCB0cnVlKTtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaCh7IHZhbHVlOiBjbGFzc2VzW2ldLm5hbWUsIHRleHQ6IGVkaXRvckxvY2FsaXphdGlvbi5nZXRTdHJpbmcoXCJxdC5cIiArIGNsYXNzZXNbaV0ubmFtZSkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmtvSXRlbXMoYXJyYXkpO1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkSXRlbShxdWVzdGlvbi5nZXRUeXBlKCkpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkSXRlbS5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7IHNlbGYuY2hhbmdlVHlwZShuZXdWYWx1ZSk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgdGV4dCgpOiBzdHJpbmcgeyByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhcInBlLnZlcmJDaGFuZ2VUeXBlXCIpOyB9XG4gICAgICAgIHByaXZhdGUgY2hhbmdlVHlwZShxdWVzdGlvblR5cGU6IHN0cmluZykge1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uVHlwZSA9PSB0aGlzLnF1ZXN0aW9uLmdldFR5cGUoKSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLnN1cnZleS5nZXRQYWdlQnlRdWVzdGlvbih0aGlzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHBhZ2UucXVlc3Rpb25zLmluZGV4T2YodGhpcy5xdWVzdGlvbik7XG4gICAgICAgICAgICB2YXIgbmV3UXVlc3Rpb24gPSBTdXJ2ZXkuUXVlc3Rpb25GYWN0b3J5Lkluc3RhbmNlLmNyZWF0ZVF1ZXN0aW9uKHF1ZXN0aW9uVHlwZSwgdGhpcy5xdWVzdGlvbi5uYW1lKTtcbiAgICAgICAgICAgIHZhciBqc29uT2JqID0gbmV3IFN1cnZleS5Kc29uT2JqZWN0KCk7XG4gICAgICAgICAgICB2YXIganNvbiA9IGpzb25PYmoudG9Kc29uT2JqZWN0KHRoaXMucXVlc3Rpb24pO1xuICAgICAgICAgICAganNvbk9iai50b09iamVjdChqc29uLCBuZXdRdWVzdGlvbik7XG4gICAgICAgICAgICBwYWdlLnJlbW92ZVF1ZXN0aW9uKHRoaXMucXVlc3Rpb24pO1xuICAgICAgICAgICAgcGFnZS5hZGRRdWVzdGlvbihuZXdRdWVzdGlvbiwgaW5kZXgpO1xuICAgICAgICAgICAgaWYgKHRoaXMub25Nb2RpZmllZENhbGxiYWNrKSB0aGlzLm9uTW9kaWZpZWRDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlWZXJiQ2hhbmdlUGFnZUl0ZW0gZXh0ZW5kcyBTdXJ2ZXlWZXJiSXRlbSB7XG4gICAgICAgIHByaXZhdGUgcHJldlBhZ2U6IFN1cnZleS5QYWdlO1xuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgc3VydmV5OiBTdXJ2ZXkuU3VydmV5LCBwdWJsaWMgcXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkJhc2UsIHB1YmxpYyBvbk1vZGlmaWVkQ2FsbGJhY2s6ICgpID0+IGFueSkge1xuICAgICAgICAgICAgc3VwZXIoc3VydmV5LCBxdWVzdGlvbiwgb25Nb2RpZmllZENhbGxiYWNrKTtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1cnZleS5wYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5zdXJ2ZXkucGFnZXNbaV07XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaCh7IHZhbHVlOiBwYWdlLCB0ZXh0OiBTdXJ2ZXlIZWxwZXIuZ2V0T2JqZWN0TmFtZShwYWdlKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMua29JdGVtcyhhcnJheSk7XG4gICAgICAgICAgICB0aGlzLnByZXZQYWdlID0gPFN1cnZleS5QYWdlPnRoaXMuc3VydmV5LmdldFBhZ2VCeVF1ZXN0aW9uKHF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMua29TZWxlY3RlZEl0ZW0odGhpcy5wcmV2UGFnZSk7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWRJdGVtLnN1YnNjcmliZShmdW5jdGlvbiAobmV3VmFsdWUpIHsgc2VsZi5jaGFuZ2VQYWdlKG5ld1ZhbHVlKTsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCB0ZXh0KCk6IHN0cmluZyB7IHJldHVybiBlZGl0b3JMb2NhbGl6YXRpb24uZ2V0U3RyaW5nKFwicGUudmVyYkNoYW5nZVBhZ2VcIik7IH1cbiAgICAgICAgcHJpdmF0ZSBjaGFuZ2VQYWdlKG5ld1BhZ2U6IFN1cnZleS5QYWdlKSB7XG4gICAgICAgICAgICBpZiAobmV3UGFnZSA9PSBudWxsIHx8IG5ld1BhZ2UgPT0gdGhpcy5wcmV2UGFnZSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5wcmV2UGFnZS5yZW1vdmVRdWVzdGlvbih0aGlzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIG5ld1BhZ2UuYWRkUXVlc3Rpb24odGhpcy5xdWVzdGlvbik7XG4gICAgICAgICAgICBpZiAodGhpcy5vbk1vZGlmaWVkQ2FsbGJhY2spIHRoaXMub25Nb2RpZmllZENhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiLyohXG4qIHN1cnZleWpzIEVkaXRvciB2MC45LjEyXG4qIChjKSBBbmRyZXcgVGVsbm92IC0gaHR0cDovL3N1cnZleWpzLm9yZy9idWlsZGVyL1xuKiBHaXRodWIgLSBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3dGVsbm92L3N1cnZleS5qcy5lZGl0b3JcbiovXG5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlVbmRvUmVkbyB7XG4gICAgICAgIHByaXZhdGUgaXRlbXM6IEFycmF5PFVuZG9SZWRvSXRlbT47XG4gICAgICAgIHByaXZhdGUgaW5kZXg6IG51bWJlciA9IC0xO1xuICAgICAgICBwdWJsaWMga29DYW5VbmRvOiBhbnk7IGtvQ2FuUmVkbzogYW55O1xuICAgICAgICBwdWJsaWMgbWF4aW11bUNvdW50OiBudW1iZXIgPSAxMDtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgICAgICB0aGlzLmtvQ2FuVW5kbyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5rb0NhblJlZG8gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgY2xlYXIoKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgICAgICB0aGlzLmtvQ2FuVW5kbyhmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmtvQ2FuUmVkbyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHNldEN1cnJlbnQoc3VydmV5OiBTdXJ2ZXkuU3VydmV5LCBzZWxlY3RlZE9iak5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBuZXcgVW5kb1JlZG9JdGVtKCk7XG4gICAgICAgICAgICBpdGVtLnN1cnZleUpTT04gPSBuZXcgU3VydmV5Lkpzb25PYmplY3QoKS50b0pzb25PYmplY3Qoc3VydmV5KTtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWRPYmpOYW1lID0gc2VsZWN0ZWRPYmpOYW1lO1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXggPCB0aGlzLml0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZSh0aGlzLmluZGV4ICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZU9sZERhdGEoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhblVuZG9SZWRvKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHVuZG8oKTogVW5kb1JlZG9JdGVtIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW5VbmRvKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRvVW5kb1JlZG8oLTEpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyByZWRvKCk6IFVuZG9SZWRvSXRlbSAge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNhblJlZG8pIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9VbmRvUmVkbygxKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHVwZGF0ZUNhblVuZG9SZWRvKCkge1xuICAgICAgICAgICAgdGhpcy5rb0NhblVuZG8odGhpcy5jYW5VbmRvKTtcbiAgICAgICAgICAgIHRoaXMua29DYW5SZWRvKHRoaXMuY2FuUmVkbyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBkb1VuZG9SZWRvKGRJbmRleDogbnVtYmVyKTogVW5kb1JlZG9JdGVtIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggKz0gZEluZGV4O1xuICAgICAgICAgICAgdGhpcy51cGRhdGVDYW5VbmRvUmVkbygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gMCAmJiB0aGlzLmluZGV4IDwgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLml0ZW1zW3RoaXMuaW5kZXhdIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgZ2V0IGNhblVuZG8oKTogYm9vbGVhbiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRleCA+PSAxICYmIHRoaXMuaW5kZXggPCB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgZ2V0IGNhblJlZG8oKTogYm9vbGVhbiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGggPiAxICYmIHRoaXMuaW5kZXggPCB0aGlzLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSByZW1vdmVPbGREYXRhKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXRlbXMubGVuZ3RoIC0gMSA8IHRoaXMubWF4aW11bUNvdW50KSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZSgwLCB0aGlzLml0ZW1zLmxlbmd0aCAtIHRoaXMubWF4aW11bUNvdW50IC0gMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIFVuZG9SZWRvSXRlbSB7XG4gICAgICAgIHN1cnZleUpTT046IGFueTtcbiAgICAgICAgc2VsZWN0ZWRPYmpOYW1lOiBzdHJpbmc7XG4gICAgfVxufSIsIi8qIVxuKiBzdXJ2ZXlqcyBFZGl0b3IgdjAuOS4xMlxuKiAoYykgQW5kcmV3IFRlbG5vdiAtIGh0dHA6Ly9zdXJ2ZXlqcy5vcmcvYnVpbGRlci9cbiogR2l0aHViIC0gaHR0cHM6Ly9naXRodWIuY29tL2FuZHJld3RlbG5vdi9zdXJ2ZXkuanMuZWRpdG9yXG4qL1xuXG5tb2R1bGUgdGVtcGxhdGVFZGl0b3Iua28geyBleHBvcnQgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInJvdyBuYXYtdGFic1wiPiAgICA8bmF2IGNsYXNzPVwibmF2YmFyLWRlZmF1bHRcIj4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXItZmx1aWRcIj4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sbGFwc2UgbmF2YmFyLWNvbGxhcHNlXCI+ICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cIm5hdiBuYXYtdGFicyBuby1ib3JkZXJzXCI+ICAgICAgICAgICAgICAgICAgICA8bGkgZGF0YS1iaW5kPVwiY3NzOiB7YWN0aXZlOiBrb1ZpZXdUeXBlKCkgPT0gXFwnYWN0aW9uc1xcJ31cIj48YSBocmVmPVwiI1wiIGRhdGEtYmluZD1cImNsaWNrOnNlbGVjdEFjdGlvblwiPlNlbGVjdCBBY3Rpb248L2E+PC9saT4gICAgICAgICAgICAgICAgICAgIDxsaSBkYXRhLWJpbmQ9XCJjc3M6IHthY3RpdmU6IGtvVmlld1R5cGUoKSA9PSBcXCdkZXNpZ25lclxcJ31cIj48YSBocmVmPVwiI1wiIGRhdGEtYmluZD1cImNsaWNrOnNlbGVjdERlc2lnbmVyQ2xpY2ssIHRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC5kZXNpZ25lclxcJylcIj48L2E+PC9saT4gICAgICAgICAgICAgICAgICAgIDwhLS0gPGxpIGRhdGEtYmluZD1cImNzczoge2FjdGl2ZToga29WaWV3VHlwZSgpID09IFxcJ3Rlc3RcXCd9XCI+PGEgaHJlZj1cIiNcIiBkYXRhLWJpbmQ9XCJcIj48L2E+PC9saT4gLS0+ICAgICAgICAgICAgICAgICAgICA8bGkgZGF0YS1iaW5kPVwidmlzaWJsZToga29TaG93U2F2ZUJ1dHRvblwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1iaW5kPVwiY2xpY2s6IHNhdmVCdXR0b25DbGlja1wiPjxzcGFuIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC5zYXZlU3VydmV5XFwnKVwiPjwvc3Bhbj48L2J1dHRvbj48L2xpPiAgICAgICAgICAgICAgICAgICAgPGxpIGRhdGEtYmluZD1cInZpc2libGU6IGtvVmlld1R5cGUoKSA9PSBcXCd0ZXN0XFwnXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDo1cHhcIj4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IHN0eWxlPVwibWFyZ2luLXRvcDogMTBweFwiIGRhdGEtYmluZD1cInZhbHVlOiBrb1Rlc3RTdXJ2ZXlXaWR0aFwiPiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMTAwJVwiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC50ZXN0U3VydmV5V2lkdGhcXCcpICsgXFwnMTAwJVxcJ1wiPjwvb3B0aW9uPiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMTIwMHB4XCIgZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ2VkLnRlc3RTdXJ2ZXlXaWR0aFxcJykgKyBcXCcxMjAwcHhcXCdcIj48L29wdGlvbj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjEwMDBweFwiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC50ZXN0U3VydmV5V2lkdGhcXCcpICsgXFwnMTAwMHB4XFwnXCI+PC9vcHRpb24+ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI4MDBweFwiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC50ZXN0U3VydmV5V2lkdGhcXCcpICsgXFwnODAwcHhcXCdcIj48L29wdGlvbj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjYwMHB4XCIgZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ2VkLnRlc3RTdXJ2ZXlXaWR0aFxcJykgKyBcXCc2MDBweFxcJ1wiPjwvb3B0aW9uPiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiNDAwcHhcIiBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwnZWQudGVzdFN1cnZleVdpZHRoXFwnKSArIFxcJzQwMHB4XFwnXCI+PC9vcHRpb24+ICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+ICAgICAgICAgICAgICAgICAgICA8L2xpPiAgICAgICAgICAgICAgICA8L3VsPiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgIDwvZGl2PiAgICA8L25hdj4gPC9kaXY+PGRpdiBjbGFzcz1cInBhbmVsXCIgc3R5bGU9XCJ3aWR0aDoxMDAlXCI+ICAgIDxkaXYgZGF0YS1iaW5kPVwidmlzaWJsZToga29WaWV3VHlwZSgpID09IFxcJ2FjdGlvbnNcXCdcIj4gICAgICAgIDxkaXYgZGF0YS1iaW5kPVwidGVtcGxhdGU6IHsgbmFtZTogXFwnYWN0aW9uc1xcJyAgfVwiPjwvZGl2PiAgICA8L2Rpdj4gICAgPGRpdiBpZD1cInN1cnZleWpzRWRpdG9yXCIgZGF0YS1iaW5kPVwidmlzaWJsZToga29WaWV3VHlwZSgpID09IFxcJ2VkaXRvclxcJ1wiIHN0eWxlPVwiaGVpZ2h0OjQ1MHB4O3dpZHRoOjEwMCVcIj48L2Rpdj4gICAgPGRpdiBpZD1cInN1cnZleWpzVGVzdFwiIGRhdGEtYmluZD1cInZpc2libGU6IGtvVmlld1R5cGUoKSA9PSBcXCd0ZXN0XFwnLCBzdHlsZToge3dpZHRoOiBrb1Rlc3RTdXJ2ZXlXaWR0aH1cIiBzdHlsZT1cIm1hcmdpbjogMTBweFwiPiAgICAgICAgPGRpdiBpZD1cInN1cnZleWpzRXhhbXBsZVwiPjwvZGl2PiAgICAgICAgPGRpdiBpZD1cInN1cnZleWpzRXhhbXBsZVJlc3VsdHNcIj48L2Rpdj4gICAgICAgIDxidXR0b24gaWQ9XCJzdXJ2ZXlqc0V4YW1wbGVyZVJ1blwiIGRhdGEtYmluZD1cImNsaWNrOnNlbGVjdFRlc3RDbGljaywgdGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ2VkLnRlc3RTdXJ2ZXlBZ2FpblxcJylcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiPlRlc3QgQWdhaW48L2J1dHRvbj4gICAgPC9kaXY+ICAgIDxkaXYgaWQ9XCJzdXJ2ZXlqc0VtYmVkXCIgZGF0YS1iaW5kPVwidmlzaWJsZToga29WaWV3VHlwZSgpID09IFxcJ2VtYmVkXFwnXCIgc3R5bGU9XCJtYXJnaW46IDEwcHhcIj4gICAgICAgIDxkaXYgZGF0YS1iaW5kPVwidGVtcGxhdGU6IHsgbmFtZTogXFwnc3VydmV5ZW1iZWRpbmdcXCcsIGRhdGE6IHN1cnZleUVtYmVkaW5nIH1cIj48L2Rpdj4gICAgPC9kaXY+ICAgIDxkaXYgY2xhc3M9XCJyb3dcIiAgZGF0YS1iaW5kPVwidmlzaWJsZToga29WaWV3VHlwZSgpID09IFxcJ2Rlc2lnbmVyXFwnXCI+ICAgICAgICA8ZGl2IGNsYXNzPVwicm93IGNvbC1tZC05XCI+ICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0zXCI+ICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCIgc3R5bGU9XCJ3aWR0aDoxMDAlXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPiAgICAgICAgICAgICAgICAgICAgICAgIDxiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC50b29sYm94XFwnKVwiPjwvYj4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ0bi1ncm91cC12ZXJ0aWNhbFwiIHN0eWxlPVwid2lkdGg6MTAwJTtwYWRkaW5nLXJpZ2h0OjJweFwiPiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0ga28gZm9yZWFjaDogcXVlc3Rpb25UeXBlcyAtLT4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmxlZnQ7IHBhZGRpbmctbGVmdDoxMHB4OyBtYXJnaW46MXB4O3dpZHRoOjEwMCVcIiBkcmFnZ2FibGU9XCJ0cnVlXCIgZGF0YS1iaW5kPVwiY2xpY2s6ICRwYXJlbnQuY2xpY2tRdWVzdGlvbiwgZXZlbnQ6e2RyYWdzdGFydDogZnVuY3Rpb24oZWwsIGUpIHsgJHBhcmVudC5kcmFnZ2luZ1F1ZXN0aW9uKCRkYXRhLCBlKTsgcmV0dXJuIHRydWU7fX1cIj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3F0LlxcJyArICRkYXRhKVwiPjwvc3Bhbj4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tIC9rbyAgLS0+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBrbyBmb3JlYWNoOiBrb0NvcGllZFF1ZXN0aW9ucyAtLT4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmxlZnQ7IHBhZGRpbmctbGVmdDoxMHB4OyBtYXJnaW46MXB4O3dpZHRoOjEwMCVcIiBkcmFnZ2FibGU9XCJ0cnVlXCIgZGF0YS1iaW5kPVwiY2xpY2s6ICRwYXJlbnQuY2xpY2tDb3BpZWRRdWVzdGlvbiwgZXZlbnQ6e2RyYWdzdGFydDogZnVuY3Rpb24oZWwsIGUpIHsgJHBhcmVudC5kcmFnZ2luZ0NvcGllZFF1ZXN0aW9uKCRkYXRhLCBlKTsgcmV0dXJuIHRydWU7fX1cIj4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gZGF0YS1iaW5kPVwidGV4dDpuYW1lXCI+PC9zcGFuPiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gL2tvICAtLT4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTlcIj4gICAgICAgICAgICAgICAgPGRpdiBkYXRhLWJpbmQ9XCJ0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwYWdlZWRpdG9yXFwnLCBkYXRhOiBwYWdlc0VkaXRvciB9XCI+PC9kaXY+ICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJvdmVyZmxvdy15OiBzY3JvbGw7aGVpZ2h0OjQ1MHB4O1wiPiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInN1cnZleWpzXCIgc3R5bGU9XCJ3aWR0aDoxMDAlXCI+PC9kaXY+ICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwic2F2ZVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1iaW5kPVwiY2xpY2s6c2F2ZVN1cnZleUNsaWNrXCI+U2F2ZSBTdXJ2ZXkhPC9idXR0b24+ICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJ0ZXN0LXN1cnZleVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1iaW5kPVwiY2xpY2s6c2VsZWN0VGVzdENsaWNrLCB0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwnZWQudGVzdFN1cnZleVxcJylcIj48L2J1dHRvbj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgIDwvZGl2PiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0zXCI+ICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIiBzdHlsZT1cIndpZHRoOjEwMCVcIj4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWJpbmQ9XCJvcHRpb25zOiBrb09iamVjdHMsIG9wdGlvbnNUZXh0OiBcXCd0ZXh0XFwnLCB2YWx1ZToga29TZWxlY3RlZE9iamVjdFwiPjwvc2VsZWN0PiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYnRuXCI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1iaW5kPVwiZW5hYmxlOiBrb0NhbkRlbGV0ZU9iamVjdCwgY2xpY2s6IGRlbGV0ZUN1cnJlbnRPYmplY3QsIGF0dHI6IHsgdGl0bGU6ICRyb290LmdldExvY1N0cmluZyhcXCdlZC5kZWxTZWxPYmplY3RcXCcpfVwiPjxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+PC9idXR0b24+ICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtYmluZD1cInRlbXBsYXRlOiB7IG5hbWU6IFxcJ29iamVjdGVkaXRvclxcJywgZGF0YTogc2VsZWN0ZWRPYmplY3RFZGl0b3IgfVwiPjwvZGl2PiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtZm9vdGVyXCIgZGF0YS1iaW5kPVwidmlzaWJsZTpzdXJ2ZXlWZXJicy5rb0hhc1ZlcmJzXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtYmluZD1cInRlbXBsYXRlOiB7IG5hbWU6IFxcJ29iamVjdHZlcmJzXFwnLCBkYXRhOiBzdXJ2ZXlWZXJicyB9XCI+PC9kaXY+ICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgIDwvZGl2PiAgICAgICAgPC9kaXY+ICAgIDwvZGl2PjwvZGl2PjxzY3JpcHQgdHlwZT1cInRleHQvaHRtbFwiIGlkPVwib2JqZWN0ZWRpdG9yXCI+ICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHN2ZF90YWJsZS1ub3dyYXBcIj4gICAgICAgIDx0Ym9keSBkYXRhLWJpbmQ9XCJmb3JlYWNoOiBrb1Byb3BlcnRpZXNcIj4gICAgICAgICAgICA8dHIgZGF0YS1iaW5kPVwiY2xpY2s6ICRwYXJlbnQuY2hhbmdlQWN0aXZlUHJvcGVydHkoJGRhdGEpLCBjc3M6IHtcXCdhY3RpdmVcXCc6ICRwYXJlbnQua29BY3RpdmVQcm9wZXJ0eSgpID09ICRkYXRhfVwiPiAgICAgICAgICAgICAgICA8dGQgZGF0YS1iaW5kPVwidGV4dDogZGlzcGxheU5hbWUsIGF0dHI6IHt0aXRsZTogdGl0bGV9XCIgd2lkdGg9XCI1MCVcIj48L3RkPiAgICAgICAgICAgICAgICA8dGQgd2lkdGg9XCI1MCVcIj4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtYmluZD1cInRleHQ6IGtvVGV4dCwgdmlzaWJsZTogJHBhcmVudC5rb0FjdGl2ZVByb3BlcnR5KCkgIT0gJGRhdGEsIGF0dHI6IHt0aXRsZToga29UZXh0fSwgc3R5bGU6IHtjb2xvcjoga29Jc0RlZmF1bHQoKSA/IFxcJ2dyYXlcXCcgOiBcXCdcXCd9XCIgc3R5bGU9XCJ0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW5cIj48L3NwYW4+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtYmluZD1cInZpc2libGU6ICRwYXJlbnQua29BY3RpdmVQcm9wZXJ0eSgpID09ICRkYXRhXCI+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwcm9wZXJ0eWVkaXRvci1cXCcgKyBlZGl0b3JUeXBlLCBkYXRhOiAkZGF0YSB9IC0tPiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gL2tvIC0tPiAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgIDwvdGQ+ICAgICAgICAgICAgPC90cj4gICAgICAgIDwvdGJvZHk+ICAgIDwvdGFibGU+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJvYmplY3R2ZXJic1wiPiAgICA8IS0tIGtvIGZvcmVhY2g6IGtvVmVyYnMgLS0+ICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+ICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+ICAgICAgICAgICAgICAgIDxzcGFuICBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCIgZGF0YS1iaW5kPVwidGV4dDp0ZXh0XCI+PC9zcGFuPiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgZGF0YS1iaW5kPVwib3B0aW9uczoga29JdGVtcywgb3B0aW9uc1RleHQ6IFxcJ3RleHRcXCcsIG9wdGlvbnNWYWx1ZTpcXCd2YWx1ZVxcJywgdmFsdWU6IGtvU2VsZWN0ZWRJdGVtXCI+PC9zZWxlY3Q+ICAgICAgICAgICAgPC9kaXY+ICAgICAgICA8L2Rpdj4gICAgPCEtLSAva28gIC0tPjwvc2NyaXB0PjxzY3JpcHQgdHlwZT1cInRleHQvaHRtbFwiIGlkPVwicGFnZWVkaXRvclwiPiAgICA8dWwgY2xhc3M9XCJuYXYgbmF2LXRhYnNcIiBkYXRhLWJpbmQ9XCJ0YWJzOnRydWVcIj4gICAgICAgIDwhLS0ga28gZm9yZWFjaDoga29QYWdlcyAtLT4gICAgICAgIDxsaSBkYXRhLWJpbmQ9XCJjc3M6IHthY3RpdmU6IGtvU2VsZWN0ZWQoKX0sZXZlbnQ6eyAgICAgICAgICAga2V5ZG93bjpmdW5jdGlvbihlbCwgZSl7ICRwYXJlbnQua2V5RG93bihlbCwgZSk7IH0sICAgICAgICAgICBkcmFnc3RhcnQ6ZnVuY3Rpb24oZWwsIGUpeyAkcGFyZW50LmRyYWdTdGFydChlbCk7IHJldHVybiB0cnVlOyB9LCAgICAgICAgICAgZHJhZ292ZXI6ZnVuY3Rpb24oZWwsIGUpeyAkcGFyZW50LmRyYWdPdmVyKGVsKTt9LCAgICAgICAgICAgZHJhZ2VuZDpmdW5jdGlvbihlbCwgZSl7ICRwYXJlbnQuZHJhZ0VuZCgpO30sICAgICAgICAgICBkcm9wOmZ1bmN0aW9uKGVsLCBlKXsgJHBhcmVudC5kcmFnRHJvcChlbCk7fSAgICAgICAgIH1cIj4gICAgICAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWJpbmQ9XCJjbGljazokcGFyZW50LnNlbGVjdFBhZ2VDbGlja1wiPiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiB0aXRsZVwiPjwvc3Bhbj4gICAgICAgICAgICA8L2E+ICAgICAgICA8L2xpPiAgICAgICAgPCEtLSAva28gIC0tPiAgICAgICAgPGxpPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1iaW5kPVwiY2xpY2s6YWRkTmV3UGFnZUNsaWNrXCI+PHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXBsdXNcIj48L3NwYW4+PC9idXR0b24+PC9saT4gICAgPC91bD48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cImFjdGlvbnNcIj4gICAgPGRpdiBjbGFzcz1cInBhbmVsXCIgc3R5bGU9XCJ3aWR0aDoxMDAlXCI+ICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+ICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTEyXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic3VydmVpZXNcIiBjbGFzcz1cImZvcm0tZ3JvdXAgY29sLXNtLThcIj4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwib2xkLXN1cnZlaWVzXCI+U2VsZWN0IFN1cnZleTwvbGFiZWw+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSA8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJvbGQtc3VydmVpZXNcIiBuYW1lPVwib2xkLXN1cnZlaWVzXCI+PC9zZWxlY3Q+IC0tPiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gPHByZSBkYXRhLWJpbmQ9XCJ0ZXh0OiBKU09OLnN0cmluZ2lmeShrby50b0pTKGF2YWlsYWJsZVN1cnZlaWVzKSlcIj48L3ByZT4gLS0+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSAgLS0+ICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBpZD1cInN1cnZlaWVzXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWJpbmQ9XCIgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogYXZhaWxhYmxlU3VydmVpZXMsICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1ZhbHVlOiBcXCdpZFxcJywgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zVGV4dDogXFwndGV4dFxcJ1wiPjwvc2VsZWN0PiAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgICAgICA8ZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PGxhYmVsPk9wZXJhdGlvbnM8L2xhYmVsPjwvZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gc2VsZWN0RGVzaWduZXJDbGljayAtLT4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGFsdD1cIkFkZCBuZXcgc3VydmV5XCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1iaW5kPVwiY2xpY2s6IGFkZE5ld1N1cnZleVwiPjxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXCI+PC9zcGFuPkFkZCBzdXJ2ZXk8L2J1dHRvbj4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIFwiIGRhdGEtYmluZD1cImV2ZW50OiB7IGNsaWNrOiBhdmFpbGFibGVTdXJ2ZXlTZWxlY3QgfVwiPkVkaXQgc3VydmV5PC9idXR0b24+ICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInJlbW92ZVwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIFwiIGRhdGEtYmluZD1cImV2ZW50OiB7IGNsaWNrOiByZW1vdmVTdXJ2ZXlDbGljayB9XCI+PHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLW1pbnVzXCI+PC9zcGFuPlJlbW92ZSBzdXJ2ZXk8L2J1dHRvbj4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgIDwvZGl2PiAgICA8L2Rpdj48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInN1cnZleWVtYmVkaW5nXCI+ICAgIDxkaXYgY2xhc3M9XCJyb3dcIj4gICAgICAgIDxzZWxlY3QgZGF0YS1iaW5kPVwidmFsdWU6a29MaWJyYXJ5VmVyc2lvblwiPiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJrbm9ja291dFwiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy5rbm9ja291dFxcJylcIj48L29wdGlvbj4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwicmVhY3RcIiBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwnZXcucmVhY3RcXCcpXCI+PC9vcHRpb24+ICAgICAgICA8L3NlbGVjdD4gICAgICAgIDxzZWxlY3QgZGF0YS1iaW5kPVwidmFsdWU6a29TY3JpcHRVc2luZ1wiPiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJib290c3RyYXBcIiBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwnZXcuYm9vdHN0cmFwXFwnKVwiPjwvb3B0aW9uPiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJzdGFuZGFyZFwiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy5zdGFuZGFyZFxcJylcIj48L29wdGlvbj4gICAgICAgIDwvc2VsZWN0PiAgICAgICAgPHNlbGVjdCBkYXRhLWJpbmQ9XCJ2YWx1ZTprb1Nob3dBc1dpbmRvd1wiPiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJwYWdlXCIgZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ2V3LnNob3dPblBhZ2VcXCcpXCI+PC9vcHRpb24+ICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIndpbmRvd1wiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy5zaG93SW5XaW5kb3dcXCcpXCI+PC9vcHRpb24+ICAgICAgICA8L3NlbGVjdD4gICAgICAgIDxsYWJlbCBjbGFzcz1cImNoZWNrYm94LWlubGluZVwiIGRhdGEtYmluZD1cInZpc2libGU6a29IYXNJZHNcIj4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1iaW5kPVwiY2hlY2tlZDprb0xvYWRTdXJ2ZXlcIiAvPiAgICAgICAgICAgIDxzcGFuIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy5sb2FkRnJvbVNlcnZlclxcJylcIj48L3NwYW4+ICAgICAgICA8L2xhYmVsPiAgICA8L2Rpdj4gICAgPGRpdiBjbGFzcz1cInBhbmVsXCI+ICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy50aXRsZVNjcmlwdFxcJylcIj48L2Rpdj4gICAgICAgIDxkaXYgaWQ9XCJzdXJ2ZXlFbWJlZGluZ0hlYWRcIiBzdHlsZT1cImhlaWdodDo3MHB4O3dpZHRoOjEwMCVcIj48L2Rpdj4gICAgPC9kaXY+ICAgIDxkaXYgY2xhc3M9XCJwYW5lbFwiIGRhdGEtYmluZD1cInZpc2libGU6IGtvVmlzaWJsZUh0bWxcIj4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCIgIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy50aXRsZUh0bWxcXCcpXCI+PC9kaXY+ICAgICAgICA8ZGl2IGlkPVwic3VydmV5RW1iZWRpbmdCb2R5XCIgc3R5bGU9XCJoZWlnaHQ6MzBweDt3aWR0aDoxMDAlXCI+PC9kaXY+ICAgIDwvZGl2PiAgICA8ZGl2IGNsYXNzPVwicGFuZWxcIj4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCIgIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdldy50aXRsZUphdmFTY3JpcHRcXCcpXCI+PC9kaXY+ICAgICAgICA8ZGl2IGlkPVwic3VydmV5RW1iZWRpbmdKYXZhXCIgc3R5bGU9XCJoZWlnaHQ6MzAwcHg7d2lkdGg6MTAwJVwiPjwvZGl2PiAgICA8L2Rpdj48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLWJvb2xlYW5cIj4gICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGRhdGEtYmluZD1cImNoZWNrZWQ6IGtvVmFsdWVcIiAvPjwvc2NyaXB0PjxzY3JpcHQgdHlwZT1cInRleHQvaHRtbFwiIGlkPVwicHJvcGVydHllZGl0b3ItZHJvcGRvd25cIj4gICAgPHNlbGVjdCBkYXRhLWJpbmQ9XCJ2YWx1ZToga29WYWx1ZSwgb3B0aW9uczogY2hvaWNlc1wiICBzdHlsZT1cIndpZHRoOjEwMCVcIj48L3NlbGVjdD48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLWh0bWxcIj4gICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwcm9wZXJ0eWVkaXRvci1tb2RhbFxcJywgZGF0YTogJGRhdGEgfSAtLT48IS0tIC9rbyAtLT48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yY29udGVudC1odG1sXCI+ICAgIDx0ZXh0YXJlYSBkYXRhLWJpbmQ9XCJ2YWx1ZTprb1ZhbHVlXCIgc3R5bGU9XCJ3aWR0aDoxMDAlXCIgcm93cz1cIjEwXCIgYXV0b2ZvY3VzPVwiYXV0b2ZvY3VzXCI+PC90ZXh0YXJlYT48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLWl0ZW12YWx1ZXNcIj4gICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwcm9wZXJ0eWVkaXRvci1tb2RhbFxcJywgZGF0YTogJGRhdGEgfSAtLT48IS0tIC9rbyAtLT48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yY29udGVudC1pdGVtdmFsdWVzXCI+ICAgIDxkaXYgc3R5bGU9XCJvdmVyZmxvdy15OiBhdXRvOyBvdmVyZmxvdy14OmhpZGRlbjsgbWF4LWhlaWdodDo0MDBweFwiPiAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGVcIj4gICAgICAgICAgICA8dGhlYWQ+ICAgICAgICAgICAgICAgIDx0cj4gICAgICAgICAgICAgICAgICAgIDx0aCBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUudmFsdWVcXCcpXCI+PC90aD4gICAgICAgICAgICAgICAgICAgIDx0aCBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUudGV4dFxcJylcIj48L3RoPiAgICAgICAgICAgICAgICAgICAgPHRoPjwvdGg+ICAgICAgICAgICAgICAgIDwvdHI+ICAgICAgICAgICAgPC90aGVhZD4gICAgICAgICAgICA8dGJvZHk+ICAgICAgICAgICAgICAgIDwhLS0ga28gZm9yZWFjaDoga29JdGVtcyAtLT4gICAgICAgICAgICAgICAgPHRyPiAgICAgICAgICAgICAgICAgICAgPHRkPiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgZGF0YS1iaW5kPVwidmFsdWU6a29WYWx1ZVwiIHN0eWxlPVwid2lkdGg6MjAwcHhcIiAvPiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXIgbm8tcGFkZGluZ1wiIHJvbGU9XCJhbGVydFwiIGRhdGEtYmluZD1cInZpc2libGU6a29IYXNFcnJvciwgdGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLmVudGVyTmV3VmFsdWVcXCcpXCI+PC9kaXY+ICAgICAgICAgICAgICAgICAgICA8L3RkPiAgICAgICAgICAgICAgICAgICAgPHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgZGF0YS1iaW5kPVwidmFsdWU6a29UZXh0XCIgc3R5bGU9XCJ3aWR0aDoyMDBweFwiIC8+PC90ZD4gICAgICAgICAgICAgICAgICAgIDx0ZD48aW5wdXQgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuXCIgZGF0YS1iaW5kPVwiY2xpY2s6ICRwYXJlbnQub25EZWxldGVDbGljaywgdmFsdWU6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS5kZWxldGVcXCcpXCIgLz48L3RkPiAgICAgICAgICAgICAgICA8L3RyPiAgICAgICAgICAgICAgICA8IS0tIC9rbyAtLT4gICAgICAgICAgICA8L3Rib2R5PiAgICAgICAgPC90YWJsZT4gICAgPC9kaXY+ICAgIDxkaXYgY2xhc3M9XCJyb3cgYnRuLXRvb2xiYXJcIj4gICAgICAgIDxpbnB1dCB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBkYXRhLWJpbmQ9XCJjbGljazogb25BZGRDbGljaywgdmFsdWU6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS5hZGROZXdcXCcpXCIgLz4gICAgICAgIDxpbnB1dCB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlclwiIGRhdGEtYmluZD1cImNsaWNrOiBvbkNsZWFyQ2xpY2ssIHZhbHVlOiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUucmVtb3ZlQWxsXFwnKVwiIC8+ICAgIDwvZGl2Pjwvc2NyaXB0PjxzY3JpcHQgdHlwZT1cInRleHQvaHRtbFwiIGlkPVwicHJvcGVydHllZGl0b3ItbWF0cml4ZHJvcGRvd25jb2x1bW5zXCI+ICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwncHJvcGVydHllZGl0b3ItbW9kYWxcXCcsIGRhdGE6ICRkYXRhIH0gLS0+PCEtLSAva28gLS0+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvcmNvbnRlbnQtbWF0cml4ZHJvcGRvd25jb2x1bW5zXCI+ICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlXCI+ICAgICAgICA8dGhlYWQ+ICAgICAgICAgICAgPHRyPiAgICAgICAgICAgICAgICA8dGggZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLnJlcXVpcmVkXFwnKVwiPjwvdGg+ICAgICAgICAgICAgICAgIDx0aCBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUuY2VsbFR5cGVcXCcpXCI+PC90aD4gICAgICAgICAgICAgICAgPHRoIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS5uYW1lXFwnKVwiPjwvdGg+ICAgICAgICAgICAgICAgIDx0aCBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUudGl0bGVcXCcpXCI+PC90aD4gICAgICAgICAgICAgICAgPHRoPjwvdGg+ICAgICAgICAgICAgPC90cj4gICAgICAgIDwvdGhlYWQ+ICAgICAgICA8dGJvZHk+ICAgICAgICAgICAgPCEtLSBrbyBmb3JlYWNoOiBrb0l0ZW1zIC0tPiAgICAgICAgICAgIDx0cj4gICAgICAgICAgICAgICAgPHRkPiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIiBkYXRhLWJpbmQ9XCJ2aXNpYmxlOmtvSGFzQ2hvaWNlcywgY2xpY2s6IG9uU2hvd0Nob2ljZXNDbGlja1wiPiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uXCIgZGF0YS1iaW5kPVwiY3NzOiB7XFwnZ2x5cGhpY29uLWNoZXZyb24tZG93blxcJzogIWtvU2hvd0Nob2ljZXMoKSwgXFwnZ2x5cGhpY29uLWNoZXZyb24tdXBcXCc6IGtvU2hvd0Nob2ljZXMoKX1cIj48L3NwYW4+ICAgICAgICAgICAgICAgICAgICA8L2E+ICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1iaW5kPVwiY2hlY2tlZDoga29Jc1JlcXVpcmVkXCIgLz4gICAgICAgICAgICAgICAgPC90ZD4gICAgICAgICAgICAgICAgPHRkPiAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGRhdGEtYmluZD1cIm9wdGlvbnM6IGNlbGxUeXBlQ2hvaWNlcywgdmFsdWU6IGtvQ2VsbFR5cGVcIiAgc3R5bGU9XCJ3aWR0aDoxMTBweFwiPjwvc2VsZWN0PiAgICAgICAgICAgICAgICA8L3RkPiAgICAgICAgICAgICAgICA8dGQ+ICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGRhdGEtYmluZD1cInZhbHVlOmtvTmFtZVwiIHN0eWxlPVwid2lkdGg6MTAwcHhcIiAvPiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlciBuby1wYWRkaW5nXCIgcm9sZT1cImFsZXJ0XCIgZGF0YS1iaW5kPVwidmlzaWJsZTprb0hhc0Vycm9yLCB0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUuZW50ZXJOZXdWYWx1ZVxcJylcIj48L2Rpdj4gICAgICAgICAgICAgICAgPC90ZD4gICAgICAgICAgICAgICAgPHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgZGF0YS1iaW5kPVwidmFsdWU6a29UaXRsZVwiIHN0eWxlPVwid2lkdGg6MTIwcHhcIiAvPjwvdGQ+ICAgICAgICAgICAgICAgIDx0ZD48aW5wdXQgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuXCIgZGF0YS1iaW5kPVwiY2xpY2s6ICRwYXJlbnQub25EZWxldGVDbGljaywgdmFsdWU6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS5kZWxldGVcXCcpXCIvPjwvdGQ+ICAgICAgICAgICAgPC90cj4gICAgICAgICAgICA8dHIgZGF0YS1iaW5kPVwidmlzaWJsZToga29TaG93Q2hvaWNlcygpICYmIGtvSGFzQ2hvaWNlcygpXCI+ICAgICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiNFwiIHN0eWxlPVwiYm9yZGVyLXRvcC1zdHlsZTpub25lXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImNvbnRyb2wtbGFiZWwgY29sLXNtLTNcIiBkYXRhLWJpbmQ9XCJ0ZXh0OiRyb290LmdldExvY1N0cmluZyhcXCdwZS5oYXNPdGhlclxcJylcIj48L2xhYmVsPiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tMlwiPiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1iaW5kPVwiY2hlY2tlZDoga29IYXNPdGhlclwiIC8+ICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zbS03XCIgZGF0YS1iaW5kPVwidmlzaWJsZTogIWtvSGFzQ29sQ291bnQoKVwiPjwvZGl2PiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImNvbnRyb2wtbGFiZWwgY29sLXNtLTNcIiBkYXRhLWJpbmQ9XCJ2aXNpYmxlOmtvSGFzQ29sQ291bnQsIHRleHQ6JHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLmNvbENvdW50XFwnKVwiPjwvbGFiZWw+ICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbCBjb2wtc20tNFwiIGRhdGEtYmluZD1cInZpc2libGU6a29IYXNDb2xDb3VudCwgb3B0aW9uczogY29sQ291bnRDaG9pY2VzLCB2YWx1ZToga29Db2xDb3VudFwiIHN0eWxlPVwid2lkdGg6MTEwcHhcIj48L3NlbGVjdD4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHkgc3ZkX25vdG9wYm90dG9tcGFkZGluZ3NcIj4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tIGtvIHRlbXBsYXRlOiB7IG5hbWU6IFxcJ3Byb3BlcnR5ZWRpdG9yY29udGVudC1pdGVtdmFsdWVzXFwnLCBkYXRhOiBjaG9pY2VzRWRpdG9yIH0gLS0+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSAva28gLS0+ICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICAgICAgPC90ZD4gICAgICAgICAgICA8L3RyPiAgICAgICAgICAgIDwhLS0gL2tvIC0tPiAgICAgICAgICAgIDx0cj4gICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIzXCI+ICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93IGJ0bi10b29sYmFyXCI+ICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGRhdGEtYmluZD1cImNsaWNrOiBvbkFkZENsaWNrLCB2YWx1ZTogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLmFkZE5ld1xcJylcIi8+ICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCIgZGF0YS1iaW5kPVwiY2xpY2s6IG9uQ2xlYXJDbGljaywgdmFsdWU6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS5yZW1vdmVBbGxcXCcpXCJcIiAvPiAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgIDwvdGQ+ICAgICAgICAgICAgPC90cj4gICAgICAgIDwvdGJvZHk+ICAgIDwvdGFibGU+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvci1tb2RhbFwiPiAgICA8ZGl2IGRhdGEtYmluZD1cInZpc2libGU6IWVkaXRvci5pc0VkaXRhYmxlXCI+ICAgICAgICA8c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiBrb1RleHRcIj48L3NwYW4+ICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiAgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcImRhdGEtdG9nZ2xlPVwibW9kYWxcIiBzdHlsZT1cInBhZGRpbmc6IDJweDtcIiBkYXRhLWJpbmQ9XCJhdHRyOiB7XFwnZGF0YS10YXJnZXRcXCcgOiBtb2RhbE5hbWVUYXJnZXR9XCI+ICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWVkaXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+ICAgICAgICA8L2J1dHRvbj4gICAgPC9kaXY+ICAgIDxkaXYgZGF0YS1iaW5kPVwidmlzaWJsZTplZGl0b3IuaXNFZGl0YWJsZVwiIHN0eWxlPVwiZGlzcGxheTp0YWJsZVwiPiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgZGF0YS1iaW5kPVwidmFsdWU6IGtvVmFsdWVcIiBzdHlsZT1cImRpc3BsYXk6dGFibGUtY2VsbDsgd2lkdGg6MTAwJVwiIC8+ICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIHN0eWxlPVwiZGlzcGxheTp0YWJsZS1jZWxsOyBwYWRkaW5nOiAycHg7XCIgIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLWJpbmQ9XCJhdHRyOiB7XFwnZGF0YS10YXJnZXRcXCcgOiBtb2RhbE5hbWVUYXJnZXR9XCI+ICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWVkaXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+ICAgICAgICA8L2J1dHRvbj4gICAgPC9kaXY+ICAgIDxkaXYgZGF0YS1iaW5kPVwiYXR0cjoge2lkIDogbW9kYWxOYW1lfVwiIGNsYXNzPVwibW9kYWwgZmFkZVwiIHJvbGU9XCJkaWFsb2dcIj4gICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1kaWFsb2dcIj4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+ICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj4mdGltZXM7PC9idXR0b24+ICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJtb2RhbC10aXRsZVwiIGRhdGEtYmluZD1cInRleHQ6ZWRpdG9yLnRpdGxlXCI+PC9oND4gICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHkgc3ZkX25vdG9wYm90dG9tcGFkZGluZ3NcIj4gICAgICAgICAgICAgICAgICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwncHJvcGVydHllZGl0b3Jjb250ZW50LVxcJyArIGVkaXRvclR5cGUsIGRhdGE6IGVkaXRvciB9IC0tPiAgICAgICAgICAgICAgICAgICAgPCEtLSAva28gLS0+ICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZm9vdGVyXCI+ICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1iaW5kPVwiY2xpY2s6IGVkaXRvci5vbkFwcGx5Q2xpY2ssIHZhbHVlOiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUuYXBwbHlcXCcpXCIgc3R5bGU9XCJ3aWR0aDoxMDBweFwiIC8+ICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1iaW5kPVwiY2xpY2s6IGVkaXRvci5vblJlc2V0Q2xpY2ssIHZhbHVlOiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUucmVzZXRcXCcpXCIgc3R5bGU9XCJ3aWR0aDoxMDBweFwiIC8+ICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBkYXRhLWJpbmQ9XCJ2YWx1ZTogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLmNsb3NlXFwnKVwiIHN0eWxlPVwid2lkdGg6MTAwcHhcIiAvPiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgIDwvZGl2PiAgICA8L2Rpdj48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLW51bWJlclwiPiAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIGRhdGEtYmluZD1cInZhbHVlOiBrb1ZhbHVlXCIgc3R5bGU9XCJ3aWR0aDoxMDAlXCIgLz48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLXJlc3RmdWxsXCI+ICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwncHJvcGVydHllZGl0b3ItbW9kYWxcXCcsIGRhdGE6ICRkYXRhIH0gLS0+PCEtLSAva28gLS0+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvcmNvbnRlbnQtcmVzdGZ1bGxcIj4gICAgPGZvcm0+ICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ1cmxcIj5Vcmw6PC9sYWJlbD4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJ1cmxcIiB0eXBlPVwidGV4dFwiIGRhdGEtYmluZD1cInZhbHVlOmtvVXJsXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiAvPiAgICAgICAgPC9kaXY+ICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJwYXRoXCI+UGF0aDo8L2xhYmVsPiAgICAgICAgICAgIDxpbnB1dCBpZD1cInBhdGhcIiB0eXBlPVwidGV4dFwiIGRhdGEtYmluZD1cInZhbHVlOmtvUGF0aFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgLz4gICAgICAgIDwvZGl2PiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4gICAgICAgICAgICA8bGFiZWwgZm9yPVwidmFsdWVOYW1lXCI+dmFsdWVOYW1lOjwvbGFiZWw+ICAgICAgICAgICAgPGlucHV0IGlkPVwidmFsdWVOYW1lXCIgdHlwZT1cInRleHRcIiBkYXRhLWJpbmQ9XCJ2YWx1ZTprb1ZhbHVlTmFtZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgLz4gICAgICAgIDwvZGl2PiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4gICAgICAgICAgICA8bGFiZWwgZm9yPVwidGl0bGVOYW1lXCI+dGl0bGVOYW1lOjwvbGFiZWw+ICAgICAgICAgICAgPGlucHV0IGlkPVwidGl0bGVOYW1lXCIgdHlwZT1cInRleHRcIiBkYXRhLWJpbmQ9XCJ2YWx1ZTprb1RpdGxlTmFtZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgLz4gICAgICAgIDwvZGl2PiAgICA8L2Zvcm0+ICAgIDxkaXYgaWQ9XCJyZXN0ZnVsbFN1cnZleVwiIHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTUwcHhcIj48L2Rpdj48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLXN0cmluZ1wiPiAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBkYXRhLWJpbmQ9XCJ2YWx1ZToga29WYWx1ZVwiIHN0eWxlPVwid2lkdGg6MTAwJVwiIC8+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvci10ZXh0XCI+ICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwncHJvcGVydHllZGl0b3ItbW9kYWxcXCcsIGRhdGE6ICRkYXRhIH0gLS0+PCEtLSAva28gLS0+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvcmNvbnRlbnQtdGV4dFwiPiAgICA8dGV4dGFyZWEgZGF0YS1iaW5kPVwidmFsdWU6a29WYWx1ZVwiIHN0eWxlPVwid2lkdGg6MTAwJVwiIHJvd3M9XCIxMFwiIGF1dG9mb2N1cz1cImF1dG9mb2N1c1wiPjwvdGV4dGFyZWE+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvci10ZXh0aXRlbXNcIj4gICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwcm9wZXJ0eWVkaXRvci1tb2RhbFxcJywgZGF0YTogJGRhdGEgfSAtLT48IS0tIC9rbyAtLT48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yY29udGVudC10ZXh0aXRlbXNcIj48ZGl2IGNsYXNzPVwicGFuZWxcIj4gICAgPHRhYmxlIGNsYXNzPVwidGFibGVcIj4gICAgICAgIDx0aGVhZD4gICAgICAgICAgICA8dHI+ICAgICAgICAgICAgICAgIDx0aCBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUubmFtZVxcJylcIj48L3RoPiAgICAgICAgICAgICAgICA8dGggZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLnRpdGxlXFwnKVwiPjwvdGg+ICAgICAgICAgICAgICAgIDx0aD48L3RoPiAgICAgICAgICAgIDwvdHI+ICAgICAgICA8L3RoZWFkPiAgICAgICAgPHRib2R5PiAgICAgICAgICAgIDwhLS0ga28gZm9yZWFjaDoga29JdGVtcyAtLT4gICAgICAgICAgICA8dHI+ICAgICAgICAgICAgICAgIDx0ZD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGRhdGEtYmluZD1cInZhbHVlOmtvTmFtZVwiIHN0eWxlPVwid2lkdGg6MjAwcHhcIiAvPjwvdGQ+ICAgICAgICAgICAgICAgIDx0ZD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGRhdGEtYmluZD1cInZhbHVlOmtvVGl0bGVcIiBzdHlsZT1cIndpZHRoOjIwMHB4XCIgLz48L3RkPiAgICAgICAgICAgICAgICA8dGQ+PGlucHV0IHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0blwiIGRhdGEtYmluZD1cImNsaWNrOiAkcGFyZW50Lm9uRGVsZXRlQ2xpY2ssIHZhbHVlOiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUuZGVsZXRlXFwnKVwiLz48L3RkPiAgICAgICAgICAgIDwvdHI+ICAgICAgICAgICAgPCEtLSAva28gLS0+ICAgICAgICAgICAgPHRyPiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cIjRcIj48aW5wdXQgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgZGF0YS1iaW5kPVwiY2xpY2s6IG9uQWRkQ2xpY2ssIHZhbHVlOiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUuYWRkTmV3XFwnKVwiLz48L3RkPiAgICAgICAgICAgIDwvdHI+ICAgICAgICA8L3Rib2R5PiAgICA8L3RhYmxlPjwvZGl2Pjwvc2NyaXB0PjxzY3JpcHQgdHlwZT1cInRleHQvaHRtbFwiIGlkPVwicHJvcGVydHllZGl0b3ItdHJpZ2dlcnNcIj4gICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwcm9wZXJ0eWVkaXRvci1tb2RhbFxcJywgZGF0YTogJGRhdGEgfSAtLT48IS0tIC9rbyAtLT48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yY29udGVudC10cmlnZ2Vyc1wiPjxkaXYgY2xhc3M9XCJwYW5lbFwiPiAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPiAgICAgICAgPGRpdiBjbGFzcz1cInJvdyBpbnB1dC1ncm91cFwiPiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZHJvcGRvd24tdG9nZ2xlIGlucHV0LWdyb3VwLWFkZG9uXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+ICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXCI+PC9zcGFuPiAgICAgICAgICAgIDwvYnV0dG9uPiAgICAgICAgICAgIDx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnUgaW5wdXQtZ3JvdXBcIj4gICAgICAgICAgICAgICAgPCEtLSBrbyBmb3JlYWNoOiBhdmFpbGFibGVUcmlnZ2VycyAtLT4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1iaW5kPVwiY2xpY2s6ICRwYXJlbnQub25BZGRDbGljaygkZGF0YSlcIj48c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiRkYXRhXCI+PC9zcGFuPjwvYT48L2xpPiAgICAgICAgICAgICAgICA8IS0tIC9rbyAgLS0+ICAgICAgICAgICAgPC91bD4gICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgZGF0YS1iaW5kPVwib3B0aW9uczoga29JdGVtcywgb3B0aW9uc1RleHQ6IFxcJ2tvVGV4dFxcJywgdmFsdWU6IGtvU2VsZWN0ZWRcIj48L3NlbGVjdD4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWJ0blwiPiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLWJpbmQ9XCJlbmFibGU6IGtvU2VsZWN0ZWQoKSAhPSBudWxsLCBjbGljazogb25EZWxldGVDbGlja1wiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCI+PHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj48L2J1dHRvbj4gICAgICAgICAgICA8L3NwYW4+ICAgICAgICA8L2Rpdj4gICAgPC9kaXY+ICAgIDxkaXYgZGF0YS1iaW5kPVwidmlzaWJsZToga29TZWxlY3RlZCgpID09IG51bGxcIj4gICAgICAgIDxkaXYgZGF0YS1iaW5kPVwidmlzaWJsZToga29RdWVzdGlvbnMoKS5sZW5ndGggPT0gMCwgdGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLm5vcXVlc3Rpb25zXFwnKVwiPjwvZGl2PiAgICAgICAgPGRpdiBkYXRhLWJpbmQ9XCJ2aXNpYmxlOiBrb1F1ZXN0aW9ucygpLmxlbmd0aCA+IDAsIHRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS5jcmVhdGV0cmlnZ2VyXFwnKVwiPjwvZGl2PiAgICA8L2Rpdj4gICAgPGRpdiBkYXRhLWJpbmQ9XCJ2aXNpYmxlOiBrb1NlbGVjdGVkKCkgIT0gbnVsbFwiPiAgICAgICAgPGRpdiBkYXRhLWJpbmQ9XCJ3aXRoOiBrb1NlbGVjdGVkXCI+ICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvdyBmb3JtLWlubGluZVwiPiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTRcIj4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS50cmlnZ2VyT25cXCcpXCI+PC9zcGFuPjxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWJpbmQ9XCJvcHRpb25zOiRwYXJlbnQua29RdWVzdGlvbnMsIHZhbHVlOiBrb05hbWVcIj48L3NlbGVjdD4gPHNwYW4+IDwvc3Bhbj4gICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tNFwiPiAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGRhdGEtYmluZD1cIm9wdGlvbnM6YXZhaWxhYmxlT3BlcmF0b3JzLCBvcHRpb25zVmFsdWU6IFxcJ25hbWVcXCcsIG9wdGlvbnNUZXh0OiBcXCd0ZXh0XFwnLCB2YWx1ZTprb09wZXJhdG9yXCI+PC9zZWxlY3Q+ICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTRcIj4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIHN0eWxlPVwicGFkZGluZzogMFwiIHR5cGU9XCJ0ZXh0XCIgZGF0YS1iaW5kPVwidmlzaWJsZToga29SZXF1aXJlVmFsdWUsIHZhbHVlOmtvVmFsdWVcIiAvPiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8IS0tIGtvIGlmOiBrb1R5cGUoKSA9PSBcXCd2aXNpYmxldHJpZ2dlclxcJyAtLT4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+ICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tNlwiPiAgICAgICAgICAgICAgICAgICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiBcXCdwcm9wZXJ0eWVkaXRvci10cmlnZ2Vyc2l0ZW1zXFwnLCBkYXRhOiBwYWdlcyB9IC0tPiAgICAgICAgICAgICAgICAgICAgPCEtLSAva28gLS0+ICAgICAgICAgICAgICAgIDwvZGl2PiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTZcIj4gICAgICAgICAgICAgICAgICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwncHJvcGVydHllZGl0b3ItdHJpZ2dlcnNpdGVtc1xcJywgZGF0YTogcXVlc3Rpb25zIH0gLS0+ICAgICAgICAgICAgICAgICAgICA8IS0tIC9rbyAtLT4gICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgPCEtLSAva28gLS0+ICAgICAgICAgICAgPCEtLSBrbyBpZjoga29UeXBlKCkgPT0gXFwnY29tcGxldGV0cmlnZ2VyXFwnIC0tPiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj4gICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwibWFyZ2luOiAxMHB4XCIgZGF0YS1iaW5kPVwidGV4dDogJHJvb3QuZ2V0TG9jU3RyaW5nKFxcJ3BlLnRyaWdnZXJDb21wbGV0ZVRleHRcXCcpXCI+PC9kaXY+ICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgPCEtLSAva28gLS0+ICAgICAgICAgICAgPCEtLSBrbyBpZjoga29UeXBlKCkgPT0gXFwnc2V0dmFsdWV0cmlnZ2VyXFwnIC0tPiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3cgZm9ybS1pbmxpbmVcIiBzdHlsZT1cIm1hcmdpbi10b3A6MTBweFwiPiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTZcIj4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGRhdGEtYmluZD1cInRleHQ6ICRyb290LmdldExvY1N0cmluZyhcXCdwZS50cmlnZ2VyU2V0VG9OYW1lXFwnKVwiPjwvc3Bhbj48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIGRhdGEtYmluZD1cInZhbHVlOmtvc2V0VG9OYW1lXCIgLz4gICAgICAgICAgICAgICAgPC9kaXY+ICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tMVwiPiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zbS01XCI+ICAgICAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUudHJpZ2dlclNldFZhbHVlXFwnKVwiPjwvc3Bhbj48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIGRhdGEtYmluZD1cInZhbHVlOmtvc2V0VmFsdWVcIiAvPiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93IGZvcm0taW5saW5lXCI+ICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tMTJcIj4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBkYXRhLWJpbmQ9XCJjaGVja2VkOiBrb2lzVmFyaWFibGVcIiAvPiA8c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiAkcm9vdC5nZXRMb2NTdHJpbmcoXFwncGUudHJpZ2dlcklzVmFyaWFibGVcXCcpXCI+PC9zcGFuPiAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgICAgICA8IS0tIC9rbyAtLT4gICAgICAgIDwvZGl2PiAgICA8L2Rpdj48L2Rpdj48L3NjcmlwdD48c2NyaXB0IHR5cGU9XCJ0ZXh0L2h0bWxcIiBpZD1cInByb3BlcnR5ZWRpdG9yLXRyaWdnZXJzaXRlbXNcIj4gICAgPGRpdiBjbGFzcz1cInBhbmVsIG5vLW1hcmdpbnMgbm8tcGFkZGluZ1wiPiAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4gICAgICAgICAgICA8c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiB0aXRsZVwiPjwvc3Bhbj4gICAgICAgIDwvZGl2PiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+ICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIG11bHRpcGxlPVwibXVsdGlwbGVcIiBkYXRhLWJpbmQ9XCJvcHRpb25zOmtvQ2hvb3NlbiwgdmFsdWU6IGtvQ2hvb3NlblNlbGVjdGVkXCI+PC9zZWxlY3Q+ICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1idG5cIiBzdHlsZT1cInZlcnRpY2FsLWFsaWduOnRvcFwiPiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLWJpbmQ9XCJlbmFibGU6IGtvQ2hvb3NlblNlbGVjdGVkKCkgIT0gbnVsbCwgY2xpY2s6IG9uRGVsZXRlQ2xpY2tcIiBjbGFzcz1cImJ0blwiPjxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+PC9idXR0b24+ICAgICAgICAgICAgPC9zcGFuPiAgICAgICAgPC9kaXY+ICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIiBzdHlsZT1cIm1hcmdpbi10b3A6NXB4XCI+ICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGRhdGEtYmluZD1cIm9wdGlvbnM6a29PYmplY3RzLCB2YWx1ZToga29TZWxlY3RlZFwiPjwvc2VsZWN0PiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYnRuXCI+ICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtYmluZD1cImVuYWJsZToga29TZWxlY3RlZCgpICE9IG51bGwsIGNsaWNrOiBvbkFkZENsaWNrXCIgc3R5bGU9XCJ3aWR0aDo0MHB4XCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIj48c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1wiPjwvc3Bhbj48L2J1dHRvbj4gICAgICAgICAgICA8L3NwYW4+ICAgICAgICA8L2Rpdj4gICAgPC9kaXY+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvci12YWxpZGF0b3JzXCI+ICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwncHJvcGVydHllZGl0b3ItbW9kYWxcXCcsIGRhdGE6ICRkYXRhIH0gLS0+PCEtLSAva28gLS0+PC9zY3JpcHQ+PHNjcmlwdCB0eXBlPVwidGV4dC9odG1sXCIgaWQ9XCJwcm9wZXJ0eWVkaXRvcmNvbnRlbnQtdmFsaWRhdG9yc1wiPjxkaXYgY2xhc3M9XCJwYW5lbFwiPiAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPiAgICAgICAgPGRpdiBjbGFzcz1cInJvdyBpbnB1dC1ncm91cFwiPiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZHJvcGRvd24tdG9nZ2xlIGlucHV0LWdyb3VwLWFkZG9uXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+ICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXCI+PC9zcGFuPiAgICAgICAgICAgIDwvYnV0dG9uPiAgICAgICAgICAgIDx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnUgaW5wdXQtZ3JvdXBcIj4gICAgICAgICAgICAgICAgPCEtLSBrbyBmb3JlYWNoOiBhdmFpbGFibGVWYWxpZGF0b3JzIC0tPiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWJpbmQ9XCJjbGljazogJHBhcmVudC5vbkFkZENsaWNrKCRkYXRhKVwiPjxzcGFuIGRhdGEtYmluZD1cInRleHQ6JGRhdGFcIj48L3NwYW4+PC9hPjwvbGk+ICAgICAgICAgICAgICAgIDwhLS0gL2tvICAtLT4gICAgICAgICAgICA8L3VsPiAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWJpbmQ9XCJvcHRpb25zOiBrb0l0ZW1zLCBvcHRpb25zVGV4dDogXFwndGV4dFxcJywgdmFsdWU6IGtvU2VsZWN0ZWRcIj48L3NlbGVjdD4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWJ0blwiPiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLWJpbmQ9XCJlbmFibGU6IGtvU2VsZWN0ZWQoKSAhPSBudWxsLCBjbGljazogb25EZWxldGVDbGlja1wiIGNsYXNzPVwiYnRuXCI+PHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj48L2J1dHRvbj4gICAgICAgICAgICA8L3NwYW4+ICAgICAgICA8L2Rpdj4gICAgPC9kaXY+ICAgIDxkaXYgZGF0YS1iaW5kPVwidGVtcGxhdGU6IHsgbmFtZTogXFwnb2JqZWN0ZWRpdG9yXFwnLCBkYXRhOiBzZWxlY3RlZE9iamVjdEVkaXRvciB9XCI+PC9kaXY+PC9kaXY+PC9zY3JpcHQ+Jzt9IiwiLyohXG4qIHN1cnZleWpzIEVkaXRvciB2MC45LjEyXG4qIChjKSBBbmRyZXcgVGVsbm92IC0gaHR0cDovL3N1cnZleWpzLm9yZy9idWlsZGVyL1xuKiBHaXRodWIgLSBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3dGVsbm92L3N1cnZleS5qcy5lZGl0b3JcbiovXG5cbm1vZHVsZSB0ZW1wbGF0ZV9wYWdlIHsgZXhwb3J0IHZhciBodG1sID0gJzxkaXYgZGF0YS1iaW5kPVwiZXZlbnQ6eyAgICAgICAgICAgZHJhZ2VudGVyOmZ1bmN0aW9uKGVsLCBlKXsgZHJhZ0VudGVyKGUpO30sICAgICAgICAgICBkcmFnbGVhdmU6ZnVuY3Rpb24oZWwsIGUpeyBkcmFnTGVhdmUoZSk7fSwgICAgICAgICAgIGRyYWdvdmVyOmZ1bmN0aW9uKGVsLCBlKXsgcmV0dXJuIGZhbHNlO30sICAgICAgICAgICBkcm9wOmZ1bmN0aW9uKGVsLCBlKXsgZHJhZ0Ryb3AoZSk7fX0gICAgIFwiPiAgICA8aDQgZGF0YS1iaW5kPVwidmlzaWJsZTogKHRpdGxlLmxlbmd0aCA+IDApICYmIGRhdGEuc2hvd1BhZ2VUaXRsZXMsIHRleHQ6IGtvTm8oKSArIHByb2Nlc3NlZFRpdGxlLCBjc3M6ICRyb290LmNzcy5wYWdlVGl0bGVcIj48L2g0PiAgICA8IS0tIGtvIGZvcmVhY2g6IHsgZGF0YTogcm93cywgYXM6IFxcJ3Jvd1xcJ30gLS0+ICAgIDxkaXYgZGF0YS1iaW5kPVwidmlzaWJsZTogcm93LmtvVmlzaWJsZSwgY3NzOiAkcm9vdC5jc3Mucm93XCI+ICAgICAgICA8IS0tIGtvIGZvcmVhY2g6IHsgZGF0YTogcm93LnF1ZXN0aW9ucywgYXM6IFxcJ3F1ZXN0aW9uXFwnICwgYWZ0ZXJSZW5kZXI6IHJvdy5rb0FmdGVyUmVuZGVyIH0gLS0+ICAgICAgICA8IS0tIGtvIHRlbXBsYXRlOiB7IG5hbWU6IFxcJ3N1cnZleS1xdWVzdGlvblxcJywgZGF0YTogcXVlc3Rpb24gfSAtLT4gICAgICAgIDwhLS0gL2tvIC0tPiAgICAgICAgPCEtLSAva28gLS0+ICAgIDwvZGl2PiAgICA8IS0tIC9rbyAtLT4gICAgPGRpdiBjbGFzcz1cIndlbGxcIiBkYXRhLWJpbmQ9XCJ2aXNpYmxlOiRyb290LmlzRGVzaWduTW9kZSAmJiBxdWVzdGlvbnMubGVuZ3RoID09IDBcIj4gICAgICAgIDxzcGFuIGRhdGEtYmluZD1cInRleHQ6JHJvb3QuZ2V0RWRpdG9yTG9jU3RyaW5nKFxcJ3N1cnZleS5kcm9wUXVlc3Rpb25cXCcpXCI+PC9zcGFuPiAgICA8L2Rpdj4gICAgPGRpdiBjbGFzcz1cInN2ZF9kcmFnb3ZlclwiIGRhdGEtYmluZD1cInZpc2libGU6IGtvRHJhZ2dpbmdCb3R0b21cIj48L2Rpdj48L2Rpdj4nO30iLCIvKiFcbiogc3VydmV5anMgRWRpdG9yIHYwLjkuMTJcbiogKGMpIEFuZHJldyBUZWxub3YgLSBodHRwOi8vc3VydmV5anMub3JnL2J1aWxkZXIvXG4qIEdpdGh1YiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXd0ZWxub3Yvc3VydmV5LmpzLmVkaXRvclxuKi9cblxubW9kdWxlIHRlbXBsYXRlX3F1ZXN0aW9uIHsgZXhwb3J0IHZhciBodG1sID0gJzxkaXYgc3R5bGU9XCJ2ZXJ0aWNhbC1hbGlnbjp0b3BcIiBkYXRhLWJpbmQ9XCJzdHlsZToge2Rpc3BsYXk6IHF1ZXN0aW9uLmtvVmlzaWJsZSgpfHwgJHJvb3QuaXNEZXNpZ25Nb2RlID8gXFwnaW5saW5lLWJsb2NrXFwnOiBcXCdub25lXFwnLCBtYXJnaW5MZWZ0OiBxdWVzdGlvbi5rb01hcmdpbkxlZnQsIHBhZGRpbmdSaWdodDogcXVlc3Rpb24ua29QYWRkaW5nUmlnaHQsIHdpZHRoOiBxdWVzdGlvbi5rb1JlbmRlcldpZHRoIH0sICAgICAgYXR0ciA6IHtpZDogaWQsIGRyYWdnYWJsZTogJHJvb3QuaXNEZXNpZ25Nb2RlfSwgY2xpY2s6ICRyb290LmlzRGVzaWduTW9kZSA/IGtvT25DbGljazogbnVsbCwgICAgICAgICAgZXZlbnQ6eyAgICAgICAgICAgZHJhZ3N0YXJ0OmZ1bmN0aW9uKGVsLCBlKXsgZHJhZ1N0YXJ0KGUpOyByZXR1cm4gdHJ1ZTsgfSwgICAgICAgICAgIGRyYWdvdmVyOmZ1bmN0aW9uKGVsLCBlKXsgZHJhZ092ZXIoZSk7fSwgICAgICAgICAgIGRyb3A6ZnVuY3Rpb24oZWwsIGUpeyBkcmFnRHJvcChlKTt9ICAgICAgICAgfSwgY3NzOntzdmRfcV9kZXNpZ25fYm9yZGVyOiAkcm9vdC5pc0Rlc2lnbk1vZGUsIHN2ZF9xX3NlbGVjdGVkIDoga29Jc1NlbGVjdGVkLCBcXCd3ZWxsIHdlbGwtc21cXCc6ICRyb290LmlzRGVzaWduTW9kZX1cIj4gICAgPGRpdiBzdHlsZT1cInZlcnRpY2FsLWFsaWduOnRvcFwiIGNsYXNzPVwic3ZkX2RyYWdvdmVyXCIgZGF0YS1iaW5kPVwidmlzaWJsZToga29Jc0RyYWdnaW5nXCI+PC9kaXY+ICAgIDxkaXYgY2xhc3M9XCJzdmRfcV9jb3B5YnV0dG9uXCIgZGF0YS1iaW5kPVwidmlzaWJsZToga29Jc1NlbGVjdGVkXCI+ICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi14c1wiIGRhdGEtYmluZD1cImNsaWNrOiAkcm9vdC5jb3B5UXVlc3Rpb25DbGljaywgdGV4dDokcm9vdC5nZXRFZGl0b3JMb2NTdHJpbmcoXFwnc3VydmV5LmNvcHlcXCcpXCI+PC9idXR0b24+ICAgIDwvZGl2PiAgICA8ZGl2IGRhdGEtYmluZD1cImNzczp7c3ZkX3FfZGVzaWduOiAkcm9vdC5pc0Rlc2lnbk1vZGV9XCI+ICAgICAgICA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCIgcm9sZT1cImFsZXJ0XCIgZGF0YS1iaW5kPVwidmlzaWJsZToga29FcnJvcnMoKS5sZW5ndGggPiAwLCBmb3JlYWNoOiBrb0Vycm9yc1wiPiAgICAgICAgICAgIDxkaXY+ICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1leGNsYW1hdGlvbi1zaWduXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9zcGFuPiAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLWJpbmQ9XCJ0ZXh0OiRkYXRhLmdldFRleHQoKVwiPjwvc3Bhbj4gICAgICAgICAgICA8L2Rpdj4gICAgICAgIDwvZGl2PiAgICAgICAgPCEtLSBrbyBpZjogcXVlc3Rpb24uaGFzVGl0bGUgLS0+ICAgICAgICA8aDUgZGF0YS1iaW5kPVwidmlzaWJsZTogJHJvb3QucXVlc3Rpb25UaXRsZUxvY2F0aW9uID09IFxcJ3RvcFxcJywgdGV4dDogcXVlc3Rpb24ua29UaXRsZSgpLCBjc3M6ICRyb290LmNzcy5xdWVzdGlvbi50aXRsZVwiPjwvaDU+ICAgICAgICA8IS0tIC9rbyAtLT4gICAgICAgIDwhLS0ga28gdGVtcGxhdGU6IHsgbmFtZTogXFwnc3VydmV5LXF1ZXN0aW9uLVxcJyArIHF1ZXN0aW9uLmdldFR5cGUoKSwgZGF0YTogcXVlc3Rpb24gfSAtLT4gICAgICAgIDwhLS0gL2tvIC0tPiAgICAgICAgPGRpdiBkYXRhLWJpbmQ9XCJ2aXNpYmxlOiBxdWVzdGlvbi5oYXNDb21tZW50XCI+ICAgICAgICAgICAgPGRpdiBkYXRhLWJpbmQ9XCJ0ZXh0OnF1ZXN0aW9uLmNvbW1lbnRUZXh0XCI+PC9kaXY+ICAgICAgICAgICAgPGRpdiBkYXRhLWJpbmQ9XCJ0ZW1wbGF0ZTogeyBuYW1lOiBcXCdzdXJ2ZXktY29tbWVudFxcJywgZGF0YToge1xcJ3F1ZXN0aW9uXFwnOiBxdWVzdGlvbiwgXFwndmlzaWJsZVxcJzogdHJ1ZSB9IH1cIj48L2Rpdj4gICAgICAgIDwvZGl2PiAgICAgICAgPCEtLSBrbyBpZjogcXVlc3Rpb24uaGFzVGl0bGUgLS0+ICAgICAgICA8aDUgZGF0YS1iaW5kPVwidmlzaWJsZTogJHJvb3QucXVlc3Rpb25UaXRsZUxvY2F0aW9uID09IFxcJ2JvdHRvbVxcJywgdGV4dDogcXVlc3Rpb24ua29UaXRsZSgpLCBjc3M6ICRyb290LmNzcy5xdWVzdGlvbi50aXRsZVwiPjwvaDU+ICAgICAgICA8IS0tIC9rbyAtLT4gICAgPC9kaXY+PC9kaXY+Jzt9IiwiLyohXG4qIHN1cnZleWpzIEVkaXRvciB2MC45LjEyXG4qIChjKSBBbmRyZXcgVGVsbm92IC0gaHR0cDovL3N1cnZleWpzLm9yZy9idWlsZGVyL1xuKiBHaXRodWIgLSBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3dGVsbm92L3N1cnZleS5qcy5lZGl0b3JcbiovXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJvYmplY3RFZGl0b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBhZ2VzRWRpdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0ZXh0V29ya2VyLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzdXJ2ZXlIZWxwZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInN1cnZleUVtYmVkaW5nV2luZG93LnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJvYmplY3RWZXJicy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZHJhZ2Ryb3BoZWxwZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInVuZG9yZWRvLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0ZW1wbGF0ZUVkaXRvci5rby5odG1sLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0ZW1wbGF0ZV9wYWdlLmh0bWwudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRlbXBsYXRlX3F1ZXN0aW9uLmh0bWwudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvZ2xvYmFscy9qcXVlcnkvaW5kZXguZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9nbG9iYWxzL2Jvb3RzdHJhcC1ub3RpZnkvaW5kZXguZC50c1wiIC8+XG5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlFZGl0b3Ige1xuICAgICAgICBwdWJsaWMgc3RhdGljIHVwZGF0ZVRleHRUaW1lb3V0OiBudW1iZXIgPSAxMDAwO1xuICAgICAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHROZXdTdXJ2ZXlUZXh0OiBzdHJpbmcgPSBcInsgcGFnZXM6IFsgeyBuYW1lOiAncGFnZTEnfV0gfVwiO1xuICAgICAgICBwcml2YXRlIHJlbmRlcmVkRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgICAgIHByaXZhdGUgc3VydmV5anM6IEhUTUxFbGVtZW50O1xuICAgICAgICBwcml2YXRlIHN1cnZleWpzRXhhbXBsZTogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgcHJpdmF0ZSBqc29uRWRpdG9yOiBBY2VBamF4LkVkaXRvcjtcbiAgICAgICAgcHJpdmF0ZSBpc1Byb2Nlc3NpbmdJbW1lZGlhdGVseTogYm9vbGVhbjtcbiAgICAgICAgcHJpdmF0ZSBzZWxlY3RlZE9iamVjdEVkaXRvcjogU3VydmV5T2JqZWN0RWRpdG9yO1xuICAgICAgICBwcml2YXRlIHBhZ2VzRWRpdG9yOiBTdXJ2ZXlQYWdlc0VkaXRvcjtcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlFbWJlZGluZzogU3VydmV5RW1iZWRpbmdXaW5kb3dcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlPYmplY3RzOiBTdXJ2ZXlPYmplY3RzO1xuICAgICAgICBwcml2YXRlIHN1cnZleVZlcmJzOiBTdXJ2ZXlWZXJicztcbiAgICAgICAgcHJpdmF0ZSB0ZXh0V29ya2VyOiBTdXJ2ZXlUZXh0V29ya2VyO1xuICAgICAgICBwcml2YXRlIHVuZG9SZWRvOiBTdXJ2ZXlVbmRvUmVkbztcbiAgICAgICAgcHJpdmF0ZSBzdXJ2ZXlWYWx1ZTogU3VydmV5LlN1cnZleTtcbiAgICAgICAgcHJpdmF0ZSBzYXZlU3VydmV5RnVuY1ZhbHVlOiAobm86IG51bWJlciwgb25TYXZlQ2FsbGJhY2s6IChubzogbnVtYmVyLCBpc1N1Y2Nlc3M6IGJvb2xlYW4pID0+IHZvaWQpID0+IHZvaWQ7XG4gICAgICAgIHByaXZhdGUgb3B0aW9uczogYW55O1xuICAgICAgICBwcml2YXRlIHN0YXRlVmFsdWU6IHN0cmluZyA9IFwiXCI7XG4gICAgICAgIHByaXZhdGUgYXZhaWxhYmxlU3VydmVpZXNPcHRpb25zTGlzdDogYW55O1xuXG4gICAgICAgIHB1YmxpYyBzdXJ2ZXlJZDogc3RyaW5nID0gbnVsbDtcbiAgICAgICAgcHVibGljIHN1cnZleVBvc3RJZDogc3RyaW5nID0gbnVsbDtcbiAgICAgICAgcHVibGljIHF1ZXN0aW9uVHlwZXM6IHN0cmluZ1tdO1xuICAgICAgICBwdWJsaWMga29Db3BpZWRRdWVzdGlvbnM6IGFueTtcbiAgICAgICAgcHVibGljIGdlbmVyYXRlVmFsaWRKU09OQ2hhbmdlZENhbGxiYWNrOiAoZ2VuZXJhdGVWYWxpZEpTT046IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgICAgIHB1YmxpYyBhbHdheVNhdmVUZXh0SW5Qcm9wZXJ0eUVkaXRvcnM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGtvSXNTaG93RGVzaWduZXI6IGFueTtcbiAgICAgICAga29WaWV3VHlwZTogYW55O1xuICAgICAgICBrb0NhbkRlbGV0ZU9iamVjdDogYW55O1xuICAgICAgICBrb09iamVjdHM6IGFueTsga29TZWxlY3RlZE9iamVjdDogYW55O1xuICAgICAgICBrb1Nob3dTYXZlQnV0dG9uOiBhbnk7XG4gICAgICAgIGtvR2VuZXJhdGVWYWxpZEpTT046IGFueTsga29TaG93T3B0aW9uczogYW55OyBrb1Rlc3RTdXJ2ZXlXaWR0aDogYW55O1xuICAgICAgICBzZWxlY3REZXNpZ25lckNsaWNrOiBhbnk7IGFkZE5ld1N1cnZleUNsaWNrOiBhbnk7IHJlbW92ZVN1cnZleUNsaWNrOiBhbnk7IHNlbGVjdEFjdGlvbjogYW55O3NlbGVjdEVkaXRvckNsaWNrOiBhbnk7IHNlbGVjdFRlc3RDbGljazogYW55OyBzZWxlY3RFbWJlZENsaWNrOiBhbnk7IGF2YWlsYWJsZVN1cnZleVNlbGVjdDogYW55OyBzYXZlU3VydmV5Q2xpY2s6IGFueTtcbiAgICAgICAgZ2VuZXJhdGVWYWxpZEpTT05DbGljazogYW55OyBnZW5lcmF0ZVJlYWRhYmxlSlNPTkNsaWNrOiBhbnk7XG4gICAgICAgIGRvVW5kb0NsaWNrOiBhbnk7IGRvUmVkb0NsaWNrOiBhbnk7XG4gICAgICAgIGRlbGV0ZU9iamVjdENsaWNrOiBhbnk7XG4gICAgICAgIGtvU3RhdGU6IGFueTtcbiAgICAgICAgcnVuU3VydmV5Q2xpY2s6IGFueTsgZW1iZWRpbmdTdXJ2ZXlDbGljazogYW55O1xuICAgICAgICBzYXZlQnV0dG9uQ2xpY2s6IGFueTtcbiAgICAgICAgZHJhZ2dpbmdRdWVzdGlvbjogYW55OyBjbGlja1F1ZXN0aW9uOiBhbnk7XG4gICAgICAgIGRyYWdnaW5nQ29waWVkUXVlc3Rpb246IGFueTsgY2xpY2tDb3BpZWRRdWVzdGlvbjogYW55O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVkRWxlbWVudDogYW55ID0gbnVsbCwgb3B0aW9uczogYW55ID0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgIHRoaXMucXVlc3Rpb25UeXBlcyA9IHRoaXMuZ2V0UXVlc3Rpb25UeXBlcygpO1xuICAgICAgICAgICAgdGhpcy5rb0NvcGllZFF1ZXN0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuICAgICAgICAgICAgdGhpcy5rb0NhbkRlbGV0ZU9iamVjdCA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMua29TdGF0ZSA9IGtvLm9ic2VydmFibGUoKTtcbiAgICAgICAgICAgIHRoaXMua29TaG93U2F2ZUJ1dHRvbiA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5rb1Nob3dPcHRpb25zID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmtvVGVzdFN1cnZleVdpZHRoID0ga28ub2JzZXJ2YWJsZShcIjEwMCVcIik7XG4gICAgICAgICAgICB0aGlzLnNhdmVCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5kb1NhdmUoKTsgfTtcbiAgICAgICAgICAgIHRoaXMua29PYmplY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLmF2YWlsYWJsZVN1cnZlaWVzID0gc2VsZi5hdmFpbGFibGVTdXJ2ZWllc09wdGlvbnNMaXN0O1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkT2JqZWN0ID0ga28ub2JzZXJ2YWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkT2JqZWN0LnN1YnNjcmliZShmdW5jdGlvbiAobmV3VmFsdWUpIHsgc2VsZi5zZWxlY3RlZE9iamVjdENoYW5nZWQobmV3VmFsdWUgIT0gbnVsbCA/IG5ld1ZhbHVlLnZhbHVlIDogbnVsbCk7IH0pO1xuICAgICAgICAgICAgdGhpcy5rb0dlbmVyYXRlVmFsaWRKU09OID0ga28ub2JzZXJ2YWJsZSh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmdlbmVyYXRlVmFsaWRKU09OKTtcbiAgICAgICAgICAgIHRoaXMua29HZW5lcmF0ZVZhbGlkSlNPTi5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLm9wdGlvbnMpIHNlbGYub3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgICAgIHNlbGYub3B0aW9ucy5nZW5lcmF0ZVZhbGlkSlNPTiA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmdlbmVyYXRlVmFsaWRKU09OQ2hhbmdlZENhbGxiYWNrKSBzZWxmLmdlbmVyYXRlVmFsaWRKU09OQ2hhbmdlZENhbGxiYWNrKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlPYmplY3RzID0gbmV3IFN1cnZleU9iamVjdHModGhpcy5rb09iamVjdHMsIHRoaXMua29TZWxlY3RlZE9iamVjdCk7XG4gICAgICAgICAgICB0aGlzLnVuZG9SZWRvID0gbmV3IFN1cnZleVVuZG9SZWRvKCk7XG4gICAgICAgICAgICB0aGlzLnN1cnZleVZlcmJzID0gbmV3IFN1cnZleVZlcmJzKGZ1bmN0aW9uICgpIHsgc2VsZi5zZXRNb2RpZmllZCgpOyB9KTtcblxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE9iamVjdEVkaXRvciA9IG5ldyBTdXJ2ZXlPYmplY3RFZGl0b3IodGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRPYmplY3RFZGl0b3Iub25Qcm9wZXJ0eVZhbHVlQ2hhbmdlZC5hZGQoKHNlbmRlciwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYub25Qcm9wZXJ0eVZhbHVlQ2hhbmdlZChvcHRpb25zLnByb3BlcnR5LCBvcHRpb25zLm9iamVjdCwgb3B0aW9ucy5uZXdWYWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucGFnZXNFZGl0b3IgPSBuZXcgU3VydmV5UGFnZXNFZGl0b3IoKCkgPT4geyBzZWxmLmFkZFBhZ2UoKTsgfSwgKHBhZ2U6IFN1cnZleS5QYWdlKSA9PiB7IHNlbGYuc3VydmV5T2JqZWN0cy5zZWxlY3RPYmplY3QocGFnZSk7IH0sXG4gICAgICAgICAgICAgICAgKGluZGV4RnJvbTogbnVtYmVyLCBpbmRleFRvOiBudW1iZXIpID0+IHsgc2VsZi5tb3ZlUGFnZShpbmRleEZyb20sIGluZGV4VG8pOyB9LCAocGFnZTogU3VydmV5LlBhZ2UpID0+IHsgc2VsZi5kZWxldGVDdXJyZW50T2JqZWN0KCk7IH0pO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZyA9IG5ldyBTdXJ2ZXlFbWJlZGluZ1dpbmRvdygpO1xuXG4gICAgICAgICAgICB0aGlzLmtvVmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKFwiYWN0aW9uXCIpO1xuICAgICAgICAgICAgdGhpcy5rb0lzU2hvd0Rlc2lnbmVyID0ga28uY29tcHV0ZWQoZnVuY3Rpb24gKCkgeyByZXR1cm4gc2VsZi5rb1ZpZXdUeXBlKCkgPT0gXCJkZXNpZ25lclwiOyB9KTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0QWN0aW9uID0gZnVuY3Rpb24gKCkgeyBzZWxmLnNob3dBY3Rpb25zKCk7IH07XG4gICAgICAgICAgICB0aGlzLnNlbGVjdERlc2lnbmVyQ2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuc2hvd0Rlc2lnbmVyKCk7IH07XG4gICAgICAgICAgICB0aGlzLmFkZE5ld1N1cnZleUNsaWNrID0gZnVuY3Rpb24gKCkge3NlbGYuYWRkTmV3U3VydmV5KCk7IH1cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU3VydmV5Q2xpY2sgPSBmdW5jdGlvbigpIHtzZWxmLnJlbW92ZVN1cnZleSgpfVxuICAgICAgICAgICAgdGhpcy5zYXZlU3VydmV5Q2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuc2F2ZVN1cnZleSgpOyB9O1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RFZGl0b3JDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5zaG93SnNvbkVkaXRvcigpOyB9O1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RUZXN0Q2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuc2hvd1Rlc3RTdXJ2ZXkoKTsgfTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RW1iZWRDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5zaG93RW1iZWRFZGl0b3IoKTsgfTtcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVWYWxpZEpTT05DbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5rb0dlbmVyYXRlVmFsaWRKU09OKHRydWUpOyB9XG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUmVhZGFibGVKU09OQ2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYua29HZW5lcmF0ZVZhbGlkSlNPTihmYWxzZSk7IH1cbiAgICAgICAgICAgIHRoaXMucnVuU3VydmV5Q2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuc2hvd0xpdmVTdXJ2ZXkoKTsgfTtcbiAgICAgICAgICAgIHRoaXMuZW1iZWRpbmdTdXJ2ZXlDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5zaG93U3VydmV5RW1iZWRpbmcoKTsgfTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlT2JqZWN0Q2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuZGVsZXRlQ3VycmVudE9iamVjdCgpOyB9O1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1F1ZXN0aW9uID0gZnVuY3Rpb24gKHF1ZXN0aW9uVHlwZSwgZSkgeyBzZWxmLmRvRHJhZ2dpbmdRdWVzdGlvbihxdWVzdGlvblR5cGUsIGUpOyB9XG4gICAgICAgICAgICB0aGlzLmNsaWNrUXVlc3Rpb24gPSBmdW5jdGlvbiAocXVlc3Rpb25UeXBlKSB7IHNlbGYuZG9DbGlja1F1ZXN0aW9uKHF1ZXN0aW9uVHlwZSk7IH1cbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdDb3BpZWRRdWVzdGlvbiA9IGZ1bmN0aW9uIChpdGVtLCBlKSB7IHNlbGYuZG9EcmFnZ2luZ0NvcGllZFF1ZXN0aW9uKGl0ZW0uanNvbiwgZSk7IH1cbiAgICAgICAgICAgIHRoaXMuY2xpY2tDb3BpZWRRdWVzdGlvbiA9IGZ1bmN0aW9uIChpdGVtKSB7IHNlbGYuZG9DbGlja0NvcGllZFF1ZXN0aW9uKGl0ZW0uanNvbik7IH1cblxuICAgICAgICAgICAgdGhpcy5kb1VuZG9DbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5kb1VuZG9SZWRvKHNlbGYudW5kb1JlZG8udW5kbygpKTsgfTtcbiAgICAgICAgICAgIHRoaXMuZG9SZWRvQ2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuZG9VbmRvUmVkbyhzZWxmLnVuZG9SZWRvLnJlZG8oKSk7IH07XG5cbiAgICAgICAgICAgIGlmIChyZW5kZXJlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcihyZW5kZXJlZEVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgc3VydmV5KCk6IFN1cnZleS5TdXJ2ZXkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3VydmV5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHJlbmRlcihlbGVtZW50OiBhbnkgPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50ID0gdGhpcy5yZW5kZXJlZEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHJldHVybjtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdGVtcGxhdGVFZGl0b3Iua28uaHRtbDtcbiAgICAgICAgICAgIHNlbGYuYXBwbHlCaW5kaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGxvYWRTdXJ2ZXkoc3VydmV5SWQ6IHN0cmluZykge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgbmV3IFN1cnZleS5keFN1cnZleVNlcnZpY2UoKS5sb2FkU3VydmV5KHN1cnZleUlkLCBmdW5jdGlvbiAoc3VjY2VzczogYm9vbGVhbiwgcmVzdWx0OiBzdHJpbmcsIHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3VjY2VzcyAmJiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50ZXh0ID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IHRleHQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5rb0lzU2hvd0Rlc2lnbmVyKCkpIHJldHVybiB0aGlzLmdldFN1cnZleVRleHRGcm9tRGVzaWduZXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmpzb25FZGl0b3IgIT0gbnVsbCA/IHRoaXMuanNvbkVkaXRvci5nZXRWYWx1ZSgpIDogXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc2V0IHRleHQodmFsdWU6IHN0cmluZykge1xuICAgICAgICAgICAgdGhpcy50ZXh0V29ya2VyID0gbmV3IFN1cnZleVRleHRXb3JrZXIodmFsdWUpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGV4dFdvcmtlci5pc0pzb25Db3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0U3VydmV5KG5ldyBTdXJ2ZXkuSnNvbk9iamVjdCgpLnRvSnNvbk9iamVjdCh0aGlzLnRleHRXb3JrZXIuc3VydmV5KSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RGVzaWduZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVuZG9SZWRvQ3VycmVudFN0YXRlKHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5rb1ZpZXdUeXBlKFwiZWRpdG9yXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgYXZhaWxhYmxlU3VydmVpZXNPcHRpb25zTGlzdCgpICB7XG4gICAgICAgICAgICB2YXIgc3VydmVpZXMgPSBuZXcgQXJyYXk7XG4gICAgICAgICAgICBzdXJ2ZWllcy5wdXNoKHt0ZXh0OiAnLVNlbGVjdCBTdXJ2ZXknfSk7XG4gICAgICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvZ2V0LXN1cnZlaWVzXCIsXG4gICAgICAgICAgICAgICAgIHR5cGU6IFwiZ2V0XCIsXG4gICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGZvciAob2JqIG9mIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cnZlaWVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBvYmouX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiU3VydmV5IFwiICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHN1cnZlaWVzO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBzZXRBdmFpbGFibGVTdXJ2ZWllc09wdGlvbnNMaXN0KHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmF2YWlsYWJsZVN1cnZlaWVzT3B0aW9uc0xpc3QgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnN0YXRlVmFsdWU7IH1cbiAgICAgICAgcHJvdGVjdGVkIHNldFN0YXRlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5rb1N0YXRlKHRoaXMuc3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHNhdmVObzogbnVtYmVyID0gMDtcbiAgICAgICAgcHJvdGVjdGVkIGRvU2F2ZSgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoXCJzYXZpbmdcIilcbiAgICAgICAgICAgIGlmICh0aGlzLnNhdmVTdXJ2ZXlGdW5jKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlTm8rKztcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlU3VydmV5RnVuYyh0aGlzLnNhdmVObyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9TYXZlQ2FsbGJhY2sobm86IG51bWJlciwgaXNTdWNjZXNzOiBib29sZWFuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFN0YXRlKFwic2F2ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zYXZlTm8gPT0gbm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdWNjZXNzKSBzZWxmLnNldFN0YXRlKFwic2F2ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbHNlIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIHNldE1vZGlmaWVkKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShcIm1vZGlmaWVkXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXRVbmRvUmVkb0N1cnJlbnRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgc2V0VW5kb1JlZG9DdXJyZW50U3RhdGUoY2xlYXJTdGF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoY2xlYXJTdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5kb1JlZG8uY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZWxPYmogPSB0aGlzLmtvU2VsZWN0ZWRPYmplY3QoKSA/IHRoaXMua29TZWxlY3RlZE9iamVjdCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIHRoaXMudW5kb1JlZG8uc2V0Q3VycmVudCh0aGlzLnN1cnZleVZhbHVlLCBzZWxPYmogPyBzZWxPYmoubmFtZSA6IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgc2F2ZVN1cnZleUZ1bmMoKSB7IHJldHVybiB0aGlzLnNhdmVTdXJ2ZXlGdW5jVmFsdWU7IH1cbiAgICAgICAgcHVibGljIHNldCBzYXZlU3VydmV5RnVuYyh2YWx1ZTogYW55KSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVTdXJ2ZXlGdW5jVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMua29TaG93U2F2ZUJ1dHRvbih2YWx1ZSAhPSBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IHNob3dPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5rb1Nob3dPcHRpb25zKCk7IH1cbiAgICAgICAgcHVibGljIHNldCBzaG93T3B0aW9ucyh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLmtvU2hvd09wdGlvbnModmFsdWUpOyB9XG4gICAgICAgIHByaXZhdGUgc2V0VGV4dFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQcm9jZXNzaW5nSW1tZWRpYXRlbHkgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuanNvbkVkaXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuanNvbkVkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5qc29uRWRpdG9yLnJlbmRlcmVyLnVwZGF0ZUZ1bGwodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NKc29uKHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuaXNQcm9jZXNzaW5nSW1tZWRpYXRlbHkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgYWRkUGFnZSgpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gU3VydmV5SGVscGVyLmdldE5ld1BhZ2VOYW1lKHRoaXMuc3VydmV5LnBhZ2VzKTtcbiAgICAgICAgICAgIHZhciBwYWdlID0gPFN1cnZleS5QYWdlPnRoaXMuc3VydmV5VmFsdWUuYWRkTmV3UGFnZShuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuYWRkUGFnZVRvVUkocGFnZSk7XG4gICAgICAgICAgICB0aGlzLnNldE1vZGlmaWVkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldExvY1N0cmluZyhzdHI6IHN0cmluZykgeyByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhzdHIpOyB9XG4gICAgICAgIHByb3RlY3RlZCBnZXRRdWVzdGlvblR5cGVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgIHZhciBhbGxUeXBlcyA9IFN1cnZleS5RdWVzdGlvbkZhY3RvcnkuSW5zdGFuY2UuZ2V0QWxsVHlwZXMoKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zIHx8ICF0aGlzLm9wdGlvbnMucXVlc3Rpb25UeXBlcyB8fCAhdGhpcy5vcHRpb25zLnF1ZXN0aW9uVHlwZXMubGVuZ3RoKSByZXR1cm4gYWxsVHlwZXM7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5xdWVzdGlvblR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uVHlwZSA9IHRoaXMub3B0aW9ucy5xdWVzdGlvblR5cGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChhbGxUeXBlcy5pbmRleE9mKHF1ZXN0aW9uVHlwZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChxdWVzdGlvblR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBtb3ZlUGFnZShpbmRleEZyb206IG51bWJlciwgaW5kZXhUbzogbnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgcGFnZSA9IDxTdXJ2ZXkuUGFnZT50aGlzLnN1cnZleS5wYWdlc1tpbmRleEZyb21dO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkucGFnZXMuc3BsaWNlKGluZGV4RnJvbSwgMSk7XG4gICAgICAgICAgICB0aGlzLnN1cnZleS5wYWdlcy5zcGxpY2UoaW5kZXhUbywgMCwgcGFnZSk7XG4gICAgICAgICAgICB0aGlzLnBhZ2VzRWRpdG9yLnN1cnZleSA9IHRoaXMuc3VydmV5O1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlPYmplY3RzLnNlbGVjdE9iamVjdChwYWdlKVxuICAgICAgICAgICAgdGhpcy5zZXRNb2RpZmllZCgpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgYWRkUGFnZVRvVUkocGFnZTogU3VydmV5LlBhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucGFnZXNFZGl0b3Iuc3VydmV5ID0gdGhpcy5zdXJ2ZXlWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5T2JqZWN0cy5hZGRQYWdlKHBhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgb25RdWVzdGlvbkFkZGVkKHF1ZXN0aW9uOiBTdXJ2ZXkuUXVlc3Rpb25CYXNlKSB7XG4gICAgICAgICAgICB2YXIgcGFnZSA9IDxTdXJ2ZXkuUGFnZT50aGlzLnN1cnZleS5nZXRQYWdlQnlRdWVzdGlvbihxdWVzdGlvbik7XG4gICAgICAgICAgICB0aGlzLnN1cnZleU9iamVjdHMuYWRkUXVlc3Rpb24ocGFnZSwgcXVlc3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBvblF1ZXN0aW9uUmVtb3ZlZChxdWVzdGlvbjogU3VydmV5LlF1ZXN0aW9uQmFzZSkge1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlPYmplY3RzLnJlbW92ZU9iamVjdChxdWVzdGlvbik7XG4gICAgICAgICAgICB0aGlzLnN1cnZleS5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIG9uUHJvcGVydHlWYWx1ZUNoYW5nZWQocHJvcGVydHk6IFN1cnZleS5Kc29uT2JqZWN0UHJvcGVydHksIG9iajogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICB2YXIgaXNEZWZhdWx0ID0gcHJvcGVydHkuaXNEZWZhdWx0VmFsdWUobmV3VmFsdWUpO1xuICAgICAgICAgICAgb2JqW3Byb3BlcnR5Lm5hbWVdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICBpZiAocHJvcGVydHkubmFtZSA9PSBcIm5hbWVcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5T2JqZWN0cy5uYW1lQ2hhbmdlZChvYmopO1xuICAgICAgICAgICAgICAgIGlmIChTdXJ2ZXlIZWxwZXIuZ2V0T2JqZWN0VHlwZShvYmopID09IE9ialR5cGUuUGFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2VzRWRpdG9yLmNoYW5nZU5hbWUoPFN1cnZleS5QYWdlPm9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRNb2RpZmllZCgpO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBkb1VuZG9SZWRvKGl0ZW06IFVuZG9SZWRvSXRlbSkge1xuICAgICAgICAgICAgdGhpcy5pbml0U3VydmV5KGl0ZW0uc3VydmV5SlNPTik7XG4gICAgICAgICAgICBpZiAoaXRlbS5zZWxlY3RlZE9iak5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsT2JqID0gdGhpcy5maW5kT2JqQnlOYW1lKGl0ZW0uc2VsZWN0ZWRPYmpOYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5T2JqZWN0cy5zZWxlY3RPYmplY3Qoc2VsT2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMudW5kb1JlZG8ua29DYW5VbmRvKCkgPyBcIm1vZGlmaWVkXCIgOiBcInNhdmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZmluZE9iakJ5TmFtZShuYW1lOiBzdHJpbmcpOiBTdXJ2ZXkuQmFzZSB7XG4gICAgICAgICAgICB2YXIgcGFnZSA9IHRoaXMuc3VydmV5LmdldFBhZ2VCeU5hbWUobmFtZSk7XG4gICAgICAgICAgICBpZiAocGFnZSkgcmV0dXJuIHBhZ2U7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSA8U3VydmV5LlF1ZXN0aW9uQmFzZT50aGlzLnN1cnZleS5nZXRRdWVzdGlvbkJ5TmFtZShuYW1lKTtcbiAgICAgICAgICAgIGlmIChxdWVzdGlvbikgcmV0dXJuIHF1ZXN0aW9uO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBjYW5Td2l0Y2hWaWV3VHlwZShuZXdUeXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgIGlmIChuZXdUeXBlICYmIHRoaXMua29WaWV3VHlwZSgpID09IG5ld1R5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmtvVmlld1R5cGUoKSAhPSBcImVkaXRvclwiIHx8ICF0aGlzLnRleHRXb3JrZXIpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRleHRXb3JrZXIuaXNKc29uQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KHRoaXMuZ2V0TG9jU3RyaW5nKFwiZWQuY29ycmVjdEpTT05cIikpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW5pdFN1cnZleShuZXcgU3VydmV5Lkpzb25PYmplY3QoKS50b0pzb25PYmplY3QodGhpcy50ZXh0V29ya2VyLnN1cnZleSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzaG93RGVzaWduZXIoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FuU3dpdGNoVmlld1R5cGUoXCJkZXNpZ25lclwiKSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5rb1ZpZXdUeXBlKFwiZGVzaWduZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBhZGROZXdTdXJ2ZXkoKSB7XG5cbiAgICAgICAgICAgIHRoaXMudGV4dCA9IFwie3BhZ2VzOiBbe25hbWU6ICdwYWdlMSd9XX1cIjtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5SWQgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5zaG93RGVzaWduZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHJlbW92ZVN1cnZleShlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAkKFwiI3JlbW92ZVwiKS50b2dnbGVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIHZhciBzdXJ2ZXkgPSBqUXVlcnkoJyNzdXJ2ZWllcyBvcHRpb246c2VsZWN0ZWQnKS52YWwoKTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9yZW1vdmUtc3VydmV5L1wiICsgc3VydmV5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm5vdGlmeSA9IGpRdWVyeS5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiUmVtb3ZpbmcgU3VydmV5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIjxzdHJvbmc+UmVtb3ZpbmcgU3VydmV5PC9zdHJvbmc+RG8gbm90IGNsb3NlIHRoaXMgcGFnZS4uLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGVyOiBcImFuaW1hdGVkIGZhZGVJbkRvd25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGl0OiBcImFuaW1hdGVkIGZhZGVPdXRVcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjcmVtb3ZlXCIpLnRvZ2dsZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm5vdGlmeS51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiUmVtb3ZpbmcgU3VydmV5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlN1cnZleSBoYXMgYmVlbiByZW1vdmVkIHN1Y2Nlc3NmdWxseVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGVyOiBcImFuaW1hdGVkIGZhZGVJbkRvd25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGl0OiBcImFuaW1hdGVkIGZhZGVPdXRVcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgc2hvd0FjdGlvbnMoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FuU3dpdGNoVmlld1R5cGUoXCJhY3Rpb25zXCIpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmtvVmlld1R5cGUoXCJhY3Rpb25zXCIpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgYXZhaWxhYmxlU3VydmV5U2VsZWN0KGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBzdXJ2ZXkgPSBqUXVlcnkoJyNzdXJ2ZWllcyBvcHRpb246c2VsZWN0ZWQnKS52YWwoKTtcbiAgICAgICAgICAgIGlmKHN1cnZleSAhPSAnJykge1xuICAgICAgICAgICAgICAgIGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9nZXQtc3VydmV5L1wiICsgc3VydmV5LFxuICAgICAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50ZXh0ID0gZGF0YVswXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdXJ2ZXlJZCA9IGRhdGFbMF0uX2lkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzYXZlU3VydmV5KGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGpRdWVyeSgnI3NhdmUnKS50b2dnbGVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBkYXRhID0geyBcbiAgICAgICAgICAgICAgICBzdXJ2ZXk6IHRoaXMudGV4dCBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZih0aGlzLnN1cnZleUlkKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdXJ2ZXlJZCA9IHRoaXMuc3VydmV5SWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvc2F2ZS1zdXJ2ZXlcIixcbiAgICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsIC8vIEFjY2VzcyBwcm9wZXJ0eSB3aXRoIDxvYmplY3Q+Ljxwcm9wZXJ0eT5cbiAgICAgICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubm90aWZ5ID0gIGpRdWVyeS5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiU2F2aW5nIFN1cnZleVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCI8c3Ryb25nPlNhdmluZyBTdXJ2ZXk8L3N0cm9uZz5EbyBub3QgY2xvc2UgdGhpcyBwYWdlLi4uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50ZXI6IFwiYW5pbWF0ZWQgZmFkZUluRG93blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXQ6IFwiYW5pbWF0ZWQgZmFkZU91dFVwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3NhdmUnKS50b2dnbGVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5ub3RpZnkudXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIlNhdmluZyBTdXJ2ZXlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiU3VydmV5IGhhcyBiZWVuIHNhdmVkIHN1Y2Nlc3NmdWxseVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGVyOiBcImFuaW1hdGVkIGZhZGVJbkRvd25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGl0OiBcImFuaW1hdGVkIGZhZGVPdXRVcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzaG93SnNvbkVkaXRvcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmtvVmlld1R5cGUoKSA9PSBcImVkaXRvclwiKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmpzb25FZGl0b3Iuc2V0VmFsdWUodGhpcy5nZXRTdXJ2ZXlUZXh0RnJvbURlc2lnbmVyKCkpO1xuICAgICAgICAgICAgdGhpcy5qc29uRWRpdG9yLmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLmtvVmlld1R5cGUoXCJlZGl0b3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzaG93VGVzdFN1cnZleSgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW5Td2l0Y2hWaWV3VHlwZShudWxsKSkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zaG93TGl2ZVN1cnZleSgpO1xuICAgICAgICAgICAgdGhpcy5rb1ZpZXdUeXBlKFwidGVzdFwiKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHNob3dFbWJlZEVkaXRvcigpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW5Td2l0Y2hWaWV3VHlwZShcImVtYmVkXCIpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNob3dTdXJ2ZXlFbWJlZGluZygpO1xuICAgICAgICAgICAgdGhpcy5rb1ZpZXdUeXBlKFwiZW1iZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRTdXJ2ZXlUZXh0RnJvbURlc2lnbmVyKCkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSBuZXcgU3VydmV5Lkpzb25PYmplY3QoKS50b0pzb25PYmplY3QodGhpcy5zdXJ2ZXkpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuZ2VuZXJhdGVWYWxpZEpTT04pIHJldHVybiBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAxKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3VydmV5SlNPTjUoKS5zdHJpbmdpZnkoanNvbiwgbnVsbCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzZWxlY3RlZE9iamVjdENoYW5nZWQob2JqOiBTdXJ2ZXkuQmFzZSkge1xuICAgICAgICAgICAgdmFyIGNhbkRlbGV0ZU9iamVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE9iamVjdEVkaXRvci5zZWxlY3RlZE9iamVjdCA9IG9iajtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmVyYnMub2JqID0gb2JqO1xuICAgICAgICAgICAgdmFyIG9ialR5cGUgPSBTdXJ2ZXlIZWxwZXIuZ2V0T2JqZWN0VHlwZShvYmopO1xuICAgICAgICAgICAgaWYgKG9ialR5cGUgPT0gT2JqVHlwZS5QYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXJ2ZXkuY3VycmVudFBhZ2UgPSA8U3VydmV5LlBhZ2U+b2JqO1xuICAgICAgICAgICAgICAgIGNhbkRlbGV0ZU9iamVjdCA9IHRoaXMuc3VydmV5LnBhZ2VzLmxlbmd0aCA+IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqVHlwZSA9PSBPYmpUeXBlLlF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXJ2ZXlbXCJzZXRzZWxlY3RlZFF1ZXN0aW9uXCJdKG9iaik7XG4gICAgICAgICAgICAgICAgY2FuRGVsZXRlT2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cnZleS5jdXJyZW50UGFnZSA9IHRoaXMuc3VydmV5LmdldFBhZ2VCeVF1ZXN0aW9uKHRoaXMuc3VydmV5W1wic2VsZWN0ZWRRdWVzdGlvblZhbHVlXCJdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXJ2ZXlbXCJzZXRzZWxlY3RlZFF1ZXN0aW9uXCJdKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5rb0NhbkRlbGV0ZU9iamVjdChjYW5EZWxldGVPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGFwcGx5QmluZGluZygpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbmRlcmVkRWxlbWVudCA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBrby5jbGVhbk5vZGUodGhpcy5yZW5kZXJlZEVsZW1lbnQpO1xuICAgICAgICAgICAga28uYXBwbHlCaW5kaW5ncyh0aGlzLCB0aGlzLnJlbmRlcmVkRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLnN1cnZleWpzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdXJ2ZXlqc1wiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1cnZleWpzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5anMub25rZXlkb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gNDYpIHNlbGYuZGVsZXRlUXVlc3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAzOCB8fCBlLmtleUNvZGUgPT0gNDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2VsZWN0UXVlc3Rpb24oZS5rZXlDb2RlID09IDM4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmpzb25FZGl0b3IgPSBhY2UuZWRpdChcInN1cnZleWpzRWRpdG9yXCIpO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlqc0V4YW1wbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1cnZleWpzRXhhbXBsZVwiKTtcblxuICAgICAgICAgICAgdGhpcy5pbml0U3VydmV5KG5ldyBTdXJ2ZXlKU09ONSgpLnBhcnNlKFN1cnZleUVkaXRvci5kZWZhdWx0TmV3U3VydmV5VGV4dCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRVbmRvUmVkb0N1cnJlbnRTdGF0ZSh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmFsdWUubW9kZSA9IFwiZGVzaWduZXJcIjtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmFsdWUucmVuZGVyKHRoaXMuc3VydmV5anMpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRKc29uRWRpdG9yKCk7XG4gICAgICAgICAgICBTdXJ2ZXlUZXh0V29ya2VyLm5ld0xpbmVDaGFyID0gdGhpcy5qc29uRWRpdG9yLnNlc3Npb24uZG9jLmdldE5ld0xpbmVDaGFyYWN0ZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGluaXRKc29uRWRpdG9yKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5qc29uRWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL21vbm9rYWlcIik7XG4gICAgICAgICAgICB0aGlzLmpzb25FZGl0b3Iuc2Vzc2lvbi5zZXRNb2RlKFwiYWNlL21vZGUvanNvblwiKTtcbiAgICAgICAgICAgIHRoaXMuanNvbkVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5qc29uRWRpdG9yLmdldFNlc3Npb24oKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbkpzb25FZGl0b3JDaGFuZ2VkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuanNvbkVkaXRvci5nZXRTZXNzaW9uKCkuc2V0VXNlV29ya2VyKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgaW5pdFN1cnZleShqc29uOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmFsdWUgPSBuZXcgU3VydmV5LlN1cnZleShqc29uKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1cnZleVZhbHVlLmlzRW1wdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cnZleVZhbHVlID0gbmV3IFN1cnZleS5TdXJ2ZXkobmV3IFN1cnZleUpTT041KCkucGFyc2UoU3VydmV5RWRpdG9yLmRlZmF1bHROZXdTdXJ2ZXlUZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnN1cnZleS5tb2RlID0gXCJkZXNpZ25lclwiO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkucmVuZGVyKHRoaXMuc3VydmV5anMpO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlPYmplY3RzLnN1cnZleSA9IHRoaXMuc3VydmV5O1xuICAgICAgICAgICAgdGhpcy5wYWdlc0VkaXRvci5zdXJ2ZXkgPSB0aGlzLnN1cnZleTtcbiAgICAgICAgICAgIHRoaXMucGFnZXNFZGl0b3Iuc2V0U2VsZWN0ZWRQYWdlKDxTdXJ2ZXkuUGFnZT50aGlzLnN1cnZleS5jdXJyZW50UGFnZSk7XG4gICAgICAgICAgICB0aGlzLnN1cnZleVZlcmJzLnN1cnZleSA9IHRoaXMuc3VydmV5O1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlWYWx1ZVtcIm9uU2VsZWN0ZWRRdWVzdGlvbkNoYW5nZWRcIl0uYWRkKChzZW5kZXI6IFN1cnZleS5TdXJ2ZXksIG9wdGlvbnMpID0+IHsgc2VsZi5zdXJ2ZXlPYmplY3RzLnNlbGVjdE9iamVjdChzZW5kZXJbXCJzZWxlY3RlZFF1ZXN0aW9uVmFsdWVcIl0pOyB9KTtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmFsdWVbXCJvbkNvcHlRdWVzdGlvblwiXS5hZGQoKHNlbmRlcjogU3VydmV5LlN1cnZleSwgb3B0aW9ucykgPT4geyBzZWxmLmNvcHlRdWVzdGlvbihzZWxmLmtvU2VsZWN0ZWRPYmplY3QoKS52YWx1ZSk7IH0pO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlWYWx1ZVtcIm9uQ3JlYXRlRHJhZ0Ryb3BIZWxwZXJcIl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBzZWxmLmNyZWF0ZURyYWdEcm9wSGVscGVyKCkgfTtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmFsdWUub25Qcm9jZXNzSHRtbC5hZGQoKHNlbmRlcjogU3VydmV5LlN1cnZleSwgb3B0aW9ucykgPT4geyBvcHRpb25zLmh0bWwgPSBzZWxmLnByb2Nlc3NIdG1sKG9wdGlvbnMuaHRtbCk7IH0pO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlWYWx1ZS5vbkN1cnJlbnRQYWdlQ2hhbmdlZC5hZGQoKHNlbmRlcjogU3VydmV5LlN1cnZleSwgb3B0aW9ucykgPT4geyBzZWxmLnBhZ2VzRWRpdG9yLnNldFNlbGVjdGVkUGFnZSg8U3VydmV5LlBhZ2U+c2VuZGVyLmN1cnJlbnRQYWdlKTsgfSk7XG4gICAgICAgICAgICB0aGlzLnN1cnZleVZhbHVlLm9uUXVlc3Rpb25BZGRlZC5hZGQoKHNlbmRlcjogU3VydmV5LlN1cnZleSwgb3B0aW9ucykgPT4geyBzZWxmLm9uUXVlc3Rpb25BZGRlZChvcHRpb25zLnF1ZXN0aW9uKTsgfSk7XG4gICAgICAgICAgICB0aGlzLnN1cnZleVZhbHVlLm9uUXVlc3Rpb25SZW1vdmVkLmFkZCgoc2VuZGVyOiBTdXJ2ZXkuU3VydmV5LCBvcHRpb25zKSA9PiB7IHNlbGYub25RdWVzdGlvblJlbW92ZWQob3B0aW9ucy5xdWVzdGlvbik7IH0pO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgcHJvY2Vzc0h0bWwoaHRtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgICAgIGlmICghaHRtbCkgcmV0dXJuIGh0bWw7XG4gICAgICAgICAgICB2YXIgc2NyaXB0UmVnRXggPSAvPHNjcmlwdFxcYltePF0qKD86KD8hPFxcL3NjcmlwdD4pPFtePF0qKSo8XFwvc2NyaXB0Pi9naTtcbiAgICAgICAgICAgIHdoaWxlIChzY3JpcHRSZWdFeC50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShzY3JpcHRSZWdFeCwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHRpbWVvdXRJZDogbnVtYmVyID0gLTE7XG4gICAgICAgIHByaXZhdGUgb25Kc29uRWRpdG9yQ2hhbmdlZCgpOiBhbnkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkID4gLTEpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgaWYgKHRoaXMuaXNQcm9jZXNzaW5nSW1tZWRpYXRlbHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXRJZCA9IC0xO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0SWQgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5wcm9jZXNzSnNvbihzZWxmLnRleHQpO1xuICAgICAgICAgICAgICAgIH0sIFN1cnZleUVkaXRvci51cGRhdGVUZXh0VGltZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBwcm9jZXNzSnNvbih0ZXh0OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAgICAgdGhpcy50ZXh0V29ya2VyID0gbmV3IFN1cnZleVRleHRXb3JrZXIodGV4dCk7XG4gICAgICAgICAgICBpZiAodGhpcy5qc29uRWRpdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5qc29uRWRpdG9yLmdldFNlc3Npb24oKS5zZXRBbm5vdGF0aW9ucyh0aGlzLmNyZWF0ZUFubm90YXRpb25zKHRleHQsIHRoaXMudGV4dFdvcmtlci5lcnJvcnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGRvRHJhZ2dpbmdRdWVzdGlvbihxdWVzdGlvblR5cGU6IGFueSwgZSkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVEcmFnRHJvcEhlbHBlcigpLnN0YXJ0RHJhZ05ld1F1ZXN0aW9uKGUsIHF1ZXN0aW9uVHlwZSwgdGhpcy5nZXROZXdRdWVzdGlvbk5hbWUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBkb0RyYWdnaW5nQ29waWVkUXVlc3Rpb24oanNvbjogYW55LCBlKSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZURyYWdEcm9wSGVscGVyKCkuc3RhcnREcmFnQ29waWVkUXVlc3Rpb24oZSwgdGhpcy5nZXROZXdRdWVzdGlvbk5hbWUoKSwganNvbik7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVEcmFnRHJvcEhlbHBlcigpOiBEcmFnRHJvcEhlbHBlciB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERyYWdEcm9wSGVscGVyKDxTdXJ2ZXkuSVN1cnZleT50aGlzLnN1cnZleSwgZnVuY3Rpb24gKCkgeyBzZWxmLnNldE1vZGlmaWVkKCkgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBkb0NsaWNrUXVlc3Rpb24ocXVlc3Rpb25UeXBlOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMuZG9DbGlja1F1ZXN0aW9uQ29yZShTdXJ2ZXkuUXVlc3Rpb25GYWN0b3J5Lkluc3RhbmNlLmNyZWF0ZVF1ZXN0aW9uKHF1ZXN0aW9uVHlwZSwgdGhpcy5nZXROZXdRdWVzdGlvbk5hbWUoKSkpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZG9DbGlja0NvcGllZFF1ZXN0aW9uKGpzb246IGFueSkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldE5ld1F1ZXN0aW9uTmFtZSgpO1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gU3VydmV5LlF1ZXN0aW9uRmFjdG9yeS5JbnN0YW5jZS5jcmVhdGVRdWVzdGlvbihqc29uW1widHlwZVwiXSwgbmFtZSk7XG4gICAgICAgICAgICBuZXcgU3VydmV5Lkpzb25PYmplY3QoKS50b09iamVjdChqc29uLCBxdWVzdGlvbik7XG4gICAgICAgICAgICBxdWVzdGlvbi5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMuZG9DbGlja1F1ZXN0aW9uQ29yZShxdWVzdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXROZXdRdWVzdGlvbk5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHJldHVybiBTdXJ2ZXlIZWxwZXIuZ2V0TmV3UXVlc3Rpb25OYW1lKHRoaXMuc3VydmV5LmdldEFsbFF1ZXN0aW9ucygpKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGRvQ2xpY2tRdWVzdGlvbkNvcmUocXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkJhc2UpIHtcbiAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5zdXJ2ZXkuY3VycmVudFBhZ2U7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1cnZleVtcInNlbGVjdGVkUXVlc3Rpb25WYWx1ZVwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBwYWdlLnF1ZXN0aW9ucy5pbmRleE9mKHRoaXMuc3VydmV5W1wic2VsZWN0ZWRRdWVzdGlvblZhbHVlXCJdKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYWdlLmFkZFF1ZXN0aW9uKHF1ZXN0aW9uLCBpbmRleCk7XG4gICAgICAgICAgICB0aGlzLnNldE1vZGlmaWVkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBkZWxldGVRdWVzdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0U2VsZWN0ZWRPYmpBc1F1ZXN0aW9uKCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUN1cnJlbnRPYmplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHNlbGVjdFF1ZXN0aW9uKGlzVXA6IGJvb2xlYW4pIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0U2VsZWN0ZWRPYmpBc1F1ZXN0aW9uKCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cnZleU9iamVjdHMuc2VsZWN0TmV4dFF1ZXN0aW9uKGlzVXApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRTZWxlY3RlZE9iakFzUXVlc3Rpb24oKTogU3VydmV5LlF1ZXN0aW9uQmFzZSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gdGhpcy5rb1NlbGVjdGVkT2JqZWN0KCkudmFsdWU7XG4gICAgICAgICAgICBpZiAoIW9iaikgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gU3VydmV5SGVscGVyLmdldE9iamVjdFR5cGUob2JqKSA9PSBPYmpUeXBlLlF1ZXN0aW9uID8gPFN1cnZleS5RdWVzdGlvbkJhc2U+KG9iaik6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBkZWxldGVDdXJyZW50T2JqZWN0KCkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVPYmplY3QodGhpcy5rb1NlbGVjdGVkT2JqZWN0KCkudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBjb3B5UXVlc3Rpb24ocXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkJhc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmpUeXBlID0gU3VydmV5SGVscGVyLmdldE9iamVjdFR5cGUocXVlc3Rpb24pO1xuICAgICAgICAgICAgaWYgKG9ialR5cGUgIT0gT2JqVHlwZS5RdWVzdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGpzb24gPSBuZXcgU3VydmV5Lkpzb25PYmplY3QoKS50b0pzb25PYmplY3QocXVlc3Rpb24pO1xuICAgICAgICAgICAganNvbi50eXBlID0gcXVlc3Rpb24uZ2V0VHlwZSgpO1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLmdldENvcGllZFF1ZXN0aW9uQnlOYW1lKHF1ZXN0aW9uLm5hbWUpO1xuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpdGVtLmpzb24gPSBqc29uO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtvQ29waWVkUXVlc3Rpb25zLnB1c2goeyBuYW1lOiBxdWVzdGlvbi5uYW1lLCBqc29uOiBqc29uIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMua29Db3BpZWRRdWVzdGlvbnMoKS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rb0NvcGllZFF1ZXN0aW9ucy5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRDb3BpZWRRdWVzdGlvbkJ5TmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMua29Db3BpZWRRdWVzdGlvbnMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbXNbaV0ubmFtZSA9PSBuYW1lKSByZXR1cm4gaXRlbXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGRlbGV0ZU9iamVjdChvYmo6IGFueSkge1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlPYmplY3RzLnJlbW92ZU9iamVjdChvYmopO1xuICAgICAgICAgICAgdmFyIG9ialR5cGUgPSBTdXJ2ZXlIZWxwZXIuZ2V0T2JqZWN0VHlwZShvYmopO1xuICAgICAgICAgICAgaWYgKG9ialR5cGUgPT0gT2JqVHlwZS5QYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXJ2ZXkucmVtb3ZlUGFnZShvYmopO1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZXNFZGl0b3IucmVtb3ZlUGFnZShvYmopO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0TW9kaWZpZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmpUeXBlID09IE9ialR5cGUuUXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cnZleS5jdXJyZW50UGFnZS5yZW1vdmVRdWVzdGlvbihvYmopO1xuICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5W1wic2V0c2VsZWN0ZWRRdWVzdGlvblwiXShudWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cnZleU9iamVjdHMuc2VsZWN0T2JqZWN0KHRoaXMuc3VydmV5LmN1cnJlbnRQYWdlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE1vZGlmaWVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnN1cnZleS5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHNob3dMaXZlU3VydmV5KCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN1cnZleWpzRXhhbXBsZSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGpzb24gPSB0aGlzLmdldFN1cnZleUpTT04oKTtcbiAgICAgICAgICAgIGlmIChqc29uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5jb29raWVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBqc29uLmNvb2tpZU5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzdXJ2ZXkgPSBuZXcgU3VydmV5LlN1cnZleShqc29uKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIHN1cnZleWpzRXhhbXBsZVJlc3VsdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1cnZleWpzRXhhbXBsZVJlc3VsdHNcIik7XG4gICAgICAgICAgICAgICAgdmFyIHN1cnZleWpzRXhhbXBsZXJlUnVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdXJ2ZXlqc0V4YW1wbGVyZVJ1blwiKTtcbiAgICAgICAgICAgICAgICBpZiAoc3VydmV5anNFeGFtcGxlUmVzdWx0cykgc3VydmV5anNFeGFtcGxlUmVzdWx0cy5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGlmIChzdXJ2ZXlqc0V4YW1wbGVyZVJ1bikgc3VydmV5anNFeGFtcGxlcmVSdW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIHN1cnZleS5vbkNvbXBsZXRlLmFkZCgoc2VuZGVyOiBTdXJ2ZXkuU3VydmV5KSA9PiB7IGlmIChzdXJ2ZXlqc0V4YW1wbGVSZXN1bHRzKSBzdXJ2ZXlqc0V4YW1wbGVSZXN1bHRzLmlubmVySFRNTCA9IHRoaXMuZ2V0TG9jU3RyaW5nKFwiZWQuc3VydmV5UmVzdWx0c1wiKSArIEpTT04uc3RyaW5naWZ5KHN1cnZleS5kYXRhKTsgaWYgKHN1cnZleWpzRXhhbXBsZXJlUnVuKSBzdXJ2ZXlqc0V4YW1wbGVyZVJ1bi5zdHlsZS5kaXNwbGF5ID0gXCJcIjsgfSk7XG4gICAgICAgICAgICAgICAgc3VydmV5LnJlbmRlcih0aGlzLnN1cnZleWpzRXhhbXBsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VydmV5anNFeGFtcGxlLmlubmVySFRNTCA9IHRoaXMuZ2V0TG9jU3RyaW5nKFwiZWQuY29ycmVjdEpTT05cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzaG93U3VydmV5RW1iZWRpbmcoKSB7XG4gICAgICAgICAgICB2YXIganNvbiA9IHRoaXMuZ2V0U3VydmV5SlNPTigpO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZy5qc29uID0ganNvbjtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5RW1iZWRpbmcuc3VydmV5SWQgPSB0aGlzLnN1cnZleUlkO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZy5zdXJ2ZXlQb3N0SWQgPSB0aGlzLnN1cnZleVBvc3RJZDtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5RW1iZWRpbmcuZ2VuZXJhdGVWYWxpZEpTT04gPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmdlbmVyYXRlVmFsaWRKU09OO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXlFbWJlZGluZy5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRTdXJ2ZXlKU09OKCk6IGFueSB7XG4gICAgICAgICAgICBpZiAodGhpcy5rb0lzU2hvd0Rlc2lnbmVyKCkpICByZXR1cm4gbmV3IFN1cnZleS5Kc29uT2JqZWN0KCkudG9Kc29uT2JqZWN0KHRoaXMuc3VydmV5KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRXb3JrZXIuaXNKc29uQ29ycmVjdCkgcmV0dXJuIG5ldyBTdXJ2ZXkuSnNvbk9iamVjdCgpLnRvSnNvbk9iamVjdCh0aGlzLnRleHRXb3JrZXIuc3VydmV5KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlQW5ub3RhdGlvbnModGV4dDogc3RyaW5nLCBlcnJvcnM6IGFueVtdKTogQWNlQWpheC5Bbm5vdGF0aW9uW10ge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV3IEFycmF5PEFjZUFqYXguQW5ub3RhdGlvbj4oKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVycm9yID0gZXJyb3JzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBhbm5vdGF0aW9uOiBBY2VBamF4LkFubm90YXRpb24gPSB7IHJvdzogZXJyb3IucG9zaXRpb24uc3RhcnQucm93LCBjb2x1bW46IGVycm9yLnBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgdGV4dDogZXJyb3IudGV4dCwgdHlwZTogXCJlcnJvclwiIH07XG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnMucHVzaChhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhbm5vdGF0aW9ucztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5ldyBTdXJ2ZXkuU3VydmV5VGVtcGxhdGVUZXh0KCkucmVwbGFjZVRleHQodGVtcGxhdGVfcGFnZS5odG1sLCBcInBhZ2VcIik7XG4gICAgbmV3IFN1cnZleS5TdXJ2ZXlUZW1wbGF0ZVRleHQoKS5yZXBsYWNlVGV4dCh0ZW1wbGF0ZV9xdWVzdGlvbi5odG1sLCBcInF1ZXN0aW9uXCIpO1xuXG4gICAgU3VydmV5LlN1cnZleS5wcm90b3R5cGVbXCJvbkNyZWF0aW5nXCJdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkUXVlc3Rpb25WYWx1ZSA9IG51bGw7XG4gICAgICAgIHRoaXMub25TZWxlY3RlZFF1ZXN0aW9uQ2hhbmdlZCA9IG5ldyBTdXJ2ZXkuRXZlbnQ8KHNlbmRlcjogU3VydmV5LlN1cnZleSwgb3B0aW9uczogYW55KSA9PiBhbnksIGFueT4oKTtcbiAgICAgICAgdGhpcy5vbkNvcHlRdWVzdGlvbiA9IG5ldyBTdXJ2ZXkuRXZlbnQ8KHNlbmRlcjogU3VydmV5LlN1cnZleSwgb3B0aW9uczogYW55KSA9PiBhbnksIGFueT4oKTtcbiAgICAgICAgdGhpcy5vbkNyZWF0ZURyYWdEcm9wSGVscGVyID0gbnVsbDtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmNvcHlRdWVzdGlvbkNsaWNrID0gZnVuY3Rpb24gKCkgeyBzZWxmLm9uQ29weVF1ZXN0aW9uLmZpcmUoc2VsZik7IH07XG4gICAgfVxuICAgIFN1cnZleS5TdXJ2ZXkucHJvdG90eXBlW1wic2V0c2VsZWN0ZWRRdWVzdGlvblwiXSA9IGZ1bmN0aW9uKHZhbHVlOiBTdXJ2ZXkuUXVlc3Rpb25CYXNlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PSB0aGlzLnNlbGVjdGVkUXVlc3Rpb25WYWx1ZSkgcmV0dXJuO1xuICAgICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLnNlbGVjdGVkUXVlc3Rpb25WYWx1ZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFF1ZXN0aW9uVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKG9sZFZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIG9sZFZhbHVlW1wib25TZWxlY3RlZFF1ZXN0aW9uQ2hhbmdlZFwiXSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkUXVlc3Rpb25WYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUXVlc3Rpb25WYWx1ZVtcIm9uU2VsZWN0ZWRRdWVzdGlvbkNoYW5nZWRcIl0oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uU2VsZWN0ZWRRdWVzdGlvbkNoYW5nZWQuZmlyZSh0aGlzLCB7ICdvbGRTZWxlY3RlZFF1ZXN0aW9uJzogb2xkVmFsdWUsICduZXdTZWxlY3RlZFF1ZXN0aW9uJzogdmFsdWUgfSk7XG4gICAgfVxuICAgIFN1cnZleS5TdXJ2ZXkucHJvdG90eXBlW1wiZ2V0RWRpdG9yTG9jU3RyaW5nXCJdID0gZnVuY3Rpb24gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyh2YWx1ZSk7XG4gICAgfVxuICAgIFN1cnZleS5QYWdlLnByb3RvdHlwZVtcIm9uQ3JlYXRpbmdcIl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5kcmFnRW50ZXJDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5rb0RyYWdnaW5nID0ga28ub2JzZXJ2YWJsZSgtMSk7XG4gICAgICAgIHRoaXMua29EcmFnZ2luZ1F1ZXN0aW9uID0ga28ub2JzZXJ2YWJsZShudWxsKTtcbiAgICAgICAgdGhpcy5rb0RyYWdnaW5nQm90dG9tID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMua29EcmFnZ2luZy5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBpZiAobmV3VmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnRW50ZXJDb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICBzZWxmLmtvRHJhZ2dpbmdRdWVzdGlvbihudWxsKTtcbiAgICAgICAgICAgICAgICBzZWxmLmtvRHJhZ2dpbmdCb3R0b20oZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gbmV3VmFsdWUgPj0gMCAmJiBuZXdWYWx1ZSA8IHNlbGYucXVlc3Rpb25zLmxlbmd0aCA/IHNlbGYucXVlc3Rpb25zW25ld1ZhbHVlXSA6IG51bGw7XG4gICAgICAgICAgICAgICAgc2VsZi5rb0RyYWdnaW5nUXVlc3Rpb24ocXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgIHNlbGYua29EcmFnZ2luZ0JvdHRvbShxdWVzdGlvbiA9PSBudWxsKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmtvRHJhZ2dpbmdRdWVzdGlvbi5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7IGlmIChuZXdWYWx1ZSkgbmV3VmFsdWUua29Jc0RyYWdnaW5nKHRydWUpOyB9KTtcbiAgICAgICAgdGhpcy5rb0RyYWdnaW5nUXVlc3Rpb24uc3Vic2NyaWJlKGZ1bmN0aW9uIChvbGRWYWx1ZSkgeyBpZiAob2xkVmFsdWUpIG9sZFZhbHVlLmtvSXNEcmFnZ2luZyhmYWxzZSk7IH0sIHRoaXMsIFwiYmVmb3JlQ2hhbmdlXCIpO1xuICAgICAgICB0aGlzLmRyYWdFbnRlciA9IGZ1bmN0aW9uIChlKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2VsZi5kcmFnRW50ZXJDb3VudGVyKys7IHNlbGYuZG9EcmFnRW50ZXIoZSk7IH07XG4gICAgICAgIHRoaXMuZHJhZ0xlYXZlID0gZnVuY3Rpb24gKGUpIHsgc2VsZi5kcmFnRW50ZXJDb3VudGVyLS07IGlmIChzZWxmLmRyYWdFbnRlckNvdW50ZXIgPT09IDApIHNlbGYua29EcmFnZ2luZygtMSk7IH07XG4gICAgICAgIHRoaXMuZHJhZ0Ryb3AgPSBmdW5jdGlvbiAoZSkgeyBzZWxmLmRvRHJvcChlKTsgfTtcbiAgICB9XG4gICAgU3VydmV5LlBhZ2UucHJvdG90eXBlW1wiZG9Ecm9wXCJdID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGRyYWdEcm9wSGVscGVyID0gdGhpcy5kYXRhW1wib25DcmVhdGVEcmFnRHJvcEhlbHBlclwiXSA/IHRoaXMuZGF0YVtcIm9uQ3JlYXRlRHJhZ0Ryb3BIZWxwZXJcIl0oKSA6IG5ldyBEcmFnRHJvcEhlbHBlcih0aGlzLmRhdGEsIG51bGwpO1xuICAgICAgICBkcmFnRHJvcEhlbHBlci5kb0Ryb3AoZSk7XG4gICAgfVxuICAgIFN1cnZleS5QYWdlLnByb3RvdHlwZVtcImRvRHJhZ0VudGVyXCJdID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5xdWVzdGlvbnMubGVuZ3RoID4gMCB8fCB0aGlzLmtvRHJhZ2dpbmcoKSA+IDApIHJldHVybjtcbiAgICAgICAgaWYgKG5ldyBEcmFnRHJvcEhlbHBlcih0aGlzLmRhdGEsIG51bGwpLmlzU3VydmV5RHJhZ2dpbmcoZSkpIHtcbiAgICAgICAgICAgIHRoaXMua29EcmFnZ2luZyh0aGlzLnF1ZXN0aW9ucy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgU3VydmV5LlF1ZXN0aW9uQmFzZS5wcm90b3R5cGVbXCJvbkNyZWF0aW5nXCJdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuZHJhZ0Ryb3BIZWxwZXJWYWx1ZSA9IG51bGw7XG4gICAgICAgIHRoaXMua29Jc0RyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuZHJhZ0Ryb3BIZWxwZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kcmFnRHJvcEhlbHBlclZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRyYWdEcm9wSGVscGVyVmFsdWUgPSBzZWxmLmRhdGFbXCJvbkNyZWF0ZURyYWdEcm9wSGVscGVyXCJdID8gc2VsZi5kYXRhW1wib25DcmVhdGVEcmFnRHJvcEhlbHBlclwiXSgpIDogbmV3IERyYWdEcm9wSGVscGVyKHNlbGYuZGF0YSwgbnVsbCk7O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZHJhZ0Ryb3BIZWxwZXJWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYWdPdmVyID0gZnVuY3Rpb24gKGUpIHsgc2VsZi5kcmFnRHJvcEhlbHBlcigpLmRvRHJhZ0Ryb3BPdmVyKGUsIHNlbGYpOyB9XG4gICAgICAgIHRoaXMuZHJhZ0Ryb3AgPSBmdW5jdGlvbiAoZSkgeyBzZWxmLmRyYWdEcm9wSGVscGVyKCkuZG9Ecm9wKGUsIHNlbGYpOyB9XG4gICAgICAgIHRoaXMuZHJhZ1N0YXJ0ID0gZnVuY3Rpb24gKGUpIHsgc2VsZi5kcmFnRHJvcEhlbHBlcigpLnN0YXJ0RHJhZ1F1ZXN0aW9uKGUsIHNlbGYubmFtZSk7IH1cbiAgICAgICAgdGhpcy5rb0lzU2VsZWN0ZWQgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5rb09uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kYXRhID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIHNlbGYuZGF0YVtcInNldHNlbGVjdGVkUXVlc3Rpb25cIl0odGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgU3VydmV5LlF1ZXN0aW9uQmFzZS5wcm90b3R5cGVbXCJvblNlbGVjdGVkUXVlc3Rpb25DaGFuZ2VkXCJdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmtvSXNTZWxlY3RlZCh0aGlzLmRhdGFbXCJzZWxlY3RlZFF1ZXN0aW9uVmFsdWVcIl0gPT0gdGhpcyk7XG4gICAgfVxufVxuIiwiLyohXG4qIHN1cnZleWpzIEVkaXRvciB2MC45LjEyXG4qIChjKSBBbmRyZXcgVGVsbm92IC0gaHR0cDovL3N1cnZleWpzLm9yZy9idWlsZGVyL1xuKiBHaXRodWIgLSBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3dGVsbm92L3N1cnZleS5qcy5lZGl0b3JcbiovXG5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuICAgIGV4cG9ydCB2YXIgZWRpdG9yTG9jYWxpemF0aW9uID0ge1xuICAgICAgICBjdXJyZW50TG9jYWxlOiBcIlwiLFxuICAgICAgICBsb2NhbGVzOiB7fSxcbiAgICAgICAgZ2V0U3RyaW5nOiBmdW5jdGlvbiAoc3RyTmFtZTogc3RyaW5nLCBsb2NhbGU6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghbG9jYWxlKSBsb2NhbGUgPSB0aGlzLmN1cnJlbnRMb2NhbGU7XG4gICAgICAgICAgICB2YXIgbG9jID0gbG9jYWxlID8gdGhpcy5sb2NhbGVzW3RoaXMuY3VycmVudExvY2FsZV0gOiBkZWZhdWx0U3RyaW5ncztcbiAgICAgICAgICAgIGlmICghbG9jKSBsb2MgPSBkZWZhdWx0U3RyaW5ncztcbiAgICAgICAgICAgIHZhciBwYXRoID0gc3RyTmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgdmFyIG9iaiA9IGxvYztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG9iaiA9IG9ialtwYXRoW2ldXTtcbiAgICAgICAgICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9jID09PSBkZWZhdWx0U3RyaW5ncykgcmV0dXJuIHBhdGhbaV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0cmluZyhzdHJOYW1lLCBcImVuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFByb3BlcnR5TmFtZTogZnVuY3Rpb24gKHN0ck5hbWU6IHN0cmluZywgbG9jYWw6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSB0aGlzLmdldFByb3BlcnR5KHN0ck5hbWUsIGxvY2FsKTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJuYW1lXCJdKSByZXR1cm4gb2JqW1wibmFtZVwiXTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFByb3BlcnR5VGl0bGU6IGZ1bmN0aW9uIChzdHJOYW1lOiBzdHJpbmcsIGxvY2FsOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gdGhpcy5nZXRQcm9wZXJ0eShzdHJOYW1lLCBsb2NhbCk7XG4gICAgICAgICAgICBpZiAob2JqW1widGl0bGVcIl0pIHJldHVybiBvYmpbXCJ0aXRsZVwiXTtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9LFxuICAgICAgICBnZXRQcm9wZXJ0eTogZnVuY3Rpb24gKHN0ck5hbWU6IHN0cmluZywgbG9jYWw6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSB0aGlzLmdldFN0cmluZyhcInAuXCIgKyBzdHJOYW1lLCBsb2NhbCk7XG4gICAgICAgICAgICBpZiAob2JqICE9PSBzdHJOYW1lKSByZXR1cm4gb2JqO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHN0ck5hbWUuaW5kZXhPZignXycpO1xuICAgICAgICAgICAgaWYgKHBvcyA8IC0xKSByZXR1cm4gb2JqO1xuICAgICAgICAgICAgc3RyTmFtZSA9IHN0ck5hbWUuc3Vic3RyKHBvcyArIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nKFwicC5cIiArIHN0ck5hbWUsIGxvY2FsKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0TG9jYWxlczogZnVuY3Rpb24gKCk6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICAgICAgdmFyIHJlcyA9IFtdO1xuICAgICAgICAgICAgcmVzLnB1c2goXCJcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5sb2NhbGVzKSB7XG4gICAgICAgICAgICAgICAgcmVzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGV4cG9ydCB2YXIgZGVmYXVsdFN0cmluZ3MgPSB7XG4gICAgICAgIC8vc3VydmV5IHRlbXBsYXRlc1xuICAgICAgICBzdXJ2ZXk6IHtcbiAgICAgICAgICAgIGRyb3BRdWVzdGlvbjogXCJQbGVhc2UgZHJvcCBhIHF1ZXN0aW9uIGhlcmUuXCIsXG4gICAgICAgICAgICBjb3B5OiBcIkNvcHlcIlxuICAgICAgICB9LFxuICAgICAgICAvL3F1ZXN0aW9uVHlwZXNcbiAgICAgICAgcXQ6IHtcbiAgICAgICAgICAgIGNoZWNrYm94OiBcIkNoZWNrYm94XCIsXG4gICAgICAgICAgICBjb21tZW50OiBcIkNvbW1lbnRcIixcbiAgICAgICAgICAgIGRyb3Bkb3duOiBcIkRyb3Bkb3duXCIsXG4gICAgICAgICAgICBmaWxlOiBcIkZpbGVcIixcbiAgICAgICAgICAgIGh0bWw6IFwiSHRtbFwiLFxuICAgICAgICAgICAgbWF0cml4OiBcIk1hdHJpeCAoc2luZ2xlIGNob2ljZSlcIixcbiAgICAgICAgICAgIG1hdHJpeGRyb3Bkb3duOiBcIk1hdHJpeCAobXVsdGlwbGUgY2hvaWNlKVwiLFxuICAgICAgICAgICAgbWF0cml4ZHluYW1pYzogXCJNYXRyaXggKGR5bmFtaWMgcm93cylcIixcbiAgICAgICAgICAgIG11bHRpcGxldGV4dDogXCJNdWx0aXBsZSBUZXh0XCIsXG4gICAgICAgICAgICByYWRpb2dyb3VwOiBcIlJhZGlvZ3JvdXBcIixcbiAgICAgICAgICAgIHJhdGluZzogXCJSYXRpbmdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiVGV4dFwiXG4gICAgICAgIH0sXG4gICAgICAgIC8vU3RyaW5ncyBpbiBFZGl0b3JcbiAgICAgICAgZWQ6IHtcbiAgICAgICAgICAgIG5ld1BhZ2VOYW1lOiBcInBhZ2VcIixcbiAgICAgICAgICAgIG5ld1F1ZXN0aW9uTmFtZTogXCJxdWVzdGlvblwiLFxuICAgICAgICAgICAgdGVzdFN1cnZleTogXCJUZXN0IFN1cnZleVwiLFxuICAgICAgICAgICAgdGVzdFN1cnZleUFnYWluOiBcIlRlc3QgU3VydmV5IEFnYWluXCIsXG4gICAgICAgICAgICB0ZXN0U3VydmV5V2lkdGg6IFwiU3VydmV5IHdpZHRoOiBcIixcbiAgICAgICAgICAgIGVtYmVkU3VydmV5OiBcIkVtYmVkIFN1cnZleVwiLFxuICAgICAgICAgICAgc2F2ZVN1cnZleTogXCJTYXZlIFN1cnZleVwiLFxuICAgICAgICAgICAgZGVzaWduZXI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIGpzb25FZGl0b3I6IFwiSlNPTiBFZGl0b3JcIixcbiAgICAgICAgICAgIHVuZG86IFwiVW5kb1wiLFxuICAgICAgICAgICAgcmVkbzogXCJSZWRvXCIsXG4gICAgICAgICAgICBvcHRpb25zOiBcIk9wdGlvbnNcIixcbiAgICAgICAgICAgIGdlbmVyYXRlVmFsaWRKU09OOiBcIkdlbmVyYXRlIFZhbGlkIEpTT05cIixcbiAgICAgICAgICAgIGdlbmVyYXRlUmVhZGFibGVKU09OOiBcIkdlbmVyYXRlIFJlYWRhYmxlIEpTT05cIixcbiAgICAgICAgICAgIHRvb2xib3g6IFwiVG9vbGJveFwiLFxuICAgICAgICAgICAgZGVsU2VsT2JqZWN0OiBcIkRlbGV0ZSBzZWxlY3RlZCBvYmplY3RcIixcbiAgICAgICAgICAgIGNvcnJlY3RKU09OOiBcIlBsZWFzZSBjb3JyZWN0IEpTT04uXCIsXG4gICAgICAgICAgICBzdXJ2ZXlSZXN1bHRzOiBcIlN1cnZleSBSZXN1bHQ6IFwiXG4gICAgICAgIH0sXG4gICAgICAgIC8vUHJvcGVydHkgRWRpdG9yc1xuICAgICAgICBwZToge1xuICAgICAgICAgICAgYXBwbHk6IFwiQXBwbHlcIixcbiAgICAgICAgICAgIHJlc2V0OiBcIlJlc2V0XCIsXG4gICAgICAgICAgICBjbG9zZTogXCJDbG9zZVwiLFxuICAgICAgICAgICAgZGVsZXRlOiBcIkRlbGV0ZVwiLFxuICAgICAgICAgICAgYWRkTmV3OiBcIkFkZCBOZXdcIixcbiAgICAgICAgICAgIHJlbW92ZUFsbDogXCJSZW1vdmUgQWxsXCIsXG4gICAgICAgICAgICBlZGl0OiBcIkVkaXRcIixcbiAgICAgICAgICAgIGVtcHR5OiBcIjxlbXB0eT5cIixcbiAgICAgICAgICAgIHRlc3RTZXJ2aWNlOiBcIlRlc3QgdGhlIHNlcnZpY2VcIixcblxuICAgICAgICAgICAgdmFsdWU6IFwiVmFsdWVcIixcbiAgICAgICAgICAgIHRleHQ6IFwiVGV4dFwiLFxuICAgICAgICAgICAgcmVxdWlyZWQ6IFwiUmVxdWlyZWQ/XCIsXG4gICAgICAgICAgICBoYXNPdGhlcjogXCJIYXMgT3RoZXIgSXRlbVwiLFxuICAgICAgICAgICAgbmFtZTogXCJOYW1lXCIsXG4gICAgICAgICAgICB0aXRsZTogXCJUaXRsZVwiLFxuICAgICAgICAgICAgY2VsbFR5cGU6IFwiQ2VsbCBUeXBlXCIsXG4gICAgICAgICAgICBjb2xDb3VudDogXCJDb2x1bW4gQ291bnRcIixcblxuICAgICAgICAgICAgZWRpdFByb3BlcnR5OiBcIkVkaXQgcHJvcGVydHkgJ3swfSdcIixcbiAgICAgICAgICAgIGl0ZW1zOiBcIlsgSXRlbXM6IHswfSBdXCIsXG5cbiAgICAgICAgICAgIGVudGVyTmV3VmFsdWU6IFwiUGxlYXNlLCBlbnRlciB0aGUgdmFsdWUuXCIsXG4gICAgICAgICAgICBub3F1ZXN0aW9uczogXCJUaGVyZSBpcyBubyBhbnkgcXVlc3Rpb24gaW4gdGhlIHN1cnZleS5cIixcbiAgICAgICAgICAgIGNyZWF0ZXRyaWdnZXI6IFwiUGxlYXNlIGNyZWF0ZSBhIHRyaWdnZXJcIixcbiAgICAgICAgICAgIHRyaWdnZXJPbjogXCJPbiBcIixcbiAgICAgICAgICAgIHRyaWdnZXJNYWtlUGFnZXNWaXNpYmxlOiBcIk1ha2UgcGFnZXMgdmlzaWJsZTpcIixcbiAgICAgICAgICAgIHRyaWdnZXJNYWtlUXVlc3Rpb25zVmlzaWJsZTogXCJNYWtlIHF1ZXN0aW9ucyB2aXNpYmxlOlwiLFxuICAgICAgICAgICAgdHJpZ2dlckNvbXBsZXRlVGV4dDogXCJDb21wbGV0ZSB0aGUgc3VydmV5IGlmIHN1Y2NlZWQuXCIsXG4gICAgICAgICAgICB0cmlnZ2VyTm90U2V0OiBcIlRoZSB0cmlnZ2VyIGlzIG5vdCBzZXRcIixcbiAgICAgICAgICAgIHRyaWdnZXJSdW5JZjogXCJSdW4gaWZcIixcbiAgICAgICAgICAgIHRyaWdnZXJTZXRUb05hbWU6IFwiQ2hhbmdlIHZhbHVlIG9mOiBcIixcbiAgICAgICAgICAgIHRyaWdnZXJTZXRWYWx1ZTogXCJ0bzogXCIsXG4gICAgICAgICAgICB0cmlnZ2VySXNWYXJpYWJsZTogXCJEbyBub3QgcHV0IHRoZSB2YXJpYWJsZSBpbnRvIHRoZSBzdXJ2ZXkgcmVzdWx0LlwiLFxuICAgICAgICAgICAgdmVyYkNoYW5nZVR5cGU6IFwiQ2hhbmdlIHR5cGUgXCIsXG4gICAgICAgICAgICB2ZXJiQ2hhbmdlUGFnZTogXCJDaGFuZ2UgcGFnZSBcIlxuICAgICAgICB9LFxuICAgICAgICAvL09wZXJhdG9yc1xuICAgICAgICBvcDoge1xuICAgICAgICAgICAgZW1wdHk6IFwiaXMgZW1wdHlcIixcbiAgICAgICAgICAgIG5vdGVtcHR5OiBcImlzIG5vdCBlbXB0eVwiLFxuICAgICAgICAgICAgZXF1YWw6IFwiZXF1YWxzXCIsXG4gICAgICAgICAgICBub3RlcXVhbDogXCJub3QgZXF1YWxzXCIsXG4gICAgICAgICAgICBjb250YWluczogXCJjb250YWluc1wiLCBcbiAgICAgICAgICAgIG5vdGNvbnRhaW5zOiBcIm5vdCBjb250YWluc1wiLFxuICAgICAgICAgICAgZ3JlYXRlcjogXCJncmVhdGVyXCIsIFxuICAgICAgICAgICAgbGVzczogXCJsZXNzXCIsXG4gICAgICAgICAgICBncmVhdGVyb3JlcXVhbDogXCJncmVhdGVyIG9yIGVxdWFsc1wiLCBcbiAgICAgICAgICAgIGxlc3NvcmVxdWFsOiBcIkxlc3Mgb3IgRXF1YWxzXCJcbiAgICAgICAgfSxcbiAgICAgICAgLy9FbWJlZCB3aW5kb3dcbiAgICAgICAgZXc6IHtcbiAgICAgICAgICAgIGtub2Nrb3V0OiBcIlVzZSBLbm9ja291dCB2ZXJzaW9uXCIsXG4gICAgICAgICAgICByZWFjdDogXCJVc2UgUmVhY3QgdmVyc2lvblwiLFxuICAgICAgICAgICAgYm9vdHN0cmFwOiBcIkZvciBib290c3RyYXAgZnJhbWV3b3JrXCIsXG4gICAgICAgICAgICBzdGFuZGFyZDogXCJObyBib290c3RyYXBcIixcbiAgICAgICAgICAgIHNob3dPblBhZ2U6IFwiU2hvdyBzdXJ2ZXkgb24gYSBwYWdlXCIsXG4gICAgICAgICAgICBzaG93SW5XaW5kb3c6IFwiU2hvdyBzdXJ2ZXkgaW4gYSB3aW5kb3dcIixcbiAgICAgICAgICAgIGxvYWRGcm9tU2VydmVyOiBcIkxvYWQgU3VydmV5IEpTT04gZnJvbSBzZXJ2ZXJcIixcbiAgICAgICAgICAgIHRpdGxlU2NyaXB0OiBcIlNjcmlwdHMgYW5kIHN0eWxlc1wiLFxuICAgICAgICAgICAgdGl0bGVIdG1sOiBcIkhUTUxcIixcbiAgICAgICAgICAgIHRpdGxlSmF2YVNjcmlwdDogXCJKYXZhU2NyaXB0XCJcbiAgICAgICAgfSxcbiAgICAgICAgLy9Qcm9wZXJ0aWVzXG4gICAgICAgIHA6IHtcbiAgICAgICAgICAgIG5hbWU6IFwibmFtZVwiLFxuICAgICAgICAgICAgdGl0bGU6IHsgbmFtZTogXCJ0aXRsZVwiLCB0aXRsZTogXCJMZWF2ZSBpdCBlbXB0eSwgaWYgaXQgaXMgdGhlIHNhbWUgYXMgJ05hbWUnXCIgfSxcbiAgICAgICAgICAgIHN1cnZleV90aXRsZTogeyBuYW1lOiBcInRpdGxlXCIsIHRpdGxlOiBcIkl0IHdpbGwgYmUgc2hvd24gb24gZXZlcnkgcGFnZS5cIiB9LFxuICAgICAgICAgICAgcGFnZV90aXRsZTogeyBuYW1lOiBcInRpdGxlXCIsIHRpdGxlOiBcIlBhZ2UgdGl0bGVcIiB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWRpdG9yTG9jYWxpemF0aW9uLmxvY2FsZXNbXCJlblwiXSA9IGRlZmF1bHRTdHJpbmdzO1xufSIsIi8qIVxuKiBzdXJ2ZXlqcyBFZGl0b3IgdjAuOS4xMlxuKiAoYykgQW5kcmV3IFRlbG5vdiAtIGh0dHA6Ly9zdXJ2ZXlqcy5vcmcvYnVpbGRlci9cbiogR2l0aHViIC0gaHR0cHM6Ly9naXRodWIuY29tL2FuZHJld3RlbG5vdi9zdXJ2ZXkuanMuZWRpdG9yXG4qL1xuXG4vLyBUaGlzIGZpbGUgaXMgYmFzZWQgb24gSlNPTjUsIGh0dHA6Ly9qc29uNS5vcmcvXG4vLyBUaGUgbW9kaWZpY2F0aW9uIGZvciBnZXR0aW5nIG9iamVjdCBhbmQgcHJvcGVydGllcyBsb2NhdGlvbiAnYXQnIHdlcmUgbWFkZW4uXG5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlKU09ONSB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcG9zaXRpb25OYW1lID0gXCJwb3NcIjtcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZXNjYXBlZSA9IHtcbiAgICAgICAgICAgIFwiJ1wiOiBcIidcIixcbiAgICAgICAgICAgICdcIic6ICdcIicsXG4gICAgICAgICAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAgICAgICAgICcvJzogJy8nLFxuICAgICAgICAgICAgJ1xcbic6ICcnLCAgICAgICAvLyBSZXBsYWNlIGVzY2FwZWQgbmV3bGluZXMgaW4gc3RyaW5ncyB3LyBlbXB0eSBzdHJpbmdcbiAgICAgICAgICAgIGI6ICdcXGInLFxuICAgICAgICAgICAgZjogJ1xcZicsXG4gICAgICAgICAgICBuOiAnXFxuJyxcbiAgICAgICAgICAgIHI6ICdcXHInLFxuICAgICAgICAgICAgdDogJ1xcdCdcbiAgICAgICAgfTtcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgd3MgPSBbXG4gICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAnXFx0JyxcbiAgICAgICAgICAgICdcXHInLFxuICAgICAgICAgICAgJ1xcbicsXG4gICAgICAgICAgICAnXFx2JyxcbiAgICAgICAgICAgICdcXGYnLFxuICAgICAgICAgICAgJ1xceEEwJyxcbiAgICAgICAgICAgICdcXHVGRUZGJ1xuICAgICAgICBdO1xuICAgICAgICBwcml2YXRlIGVuZEF0OiBudW1iZXI7XG4gICAgICAgIHByaXZhdGUgYXQ6IG51bWJlcjsgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBjaGFyYWN0ZXJcbiAgICAgICAgcHJpdmF0ZSBjaDogYW55OyAgICAgLy8gVGhlIGN1cnJlbnQgY2hhcmFjdGVyXG4gICAgICAgIHByaXZhdGUgdGV4dDogc3RyaW5nO1xuICAgICAgICBwcml2YXRlIHBhcnNlVHlwZTogbnVtYmVyOyAvLyAwIC0gc3RhZGFyZCwgMSAtIGdldCBpbmZvcm1hdGlvbiBhYm91dCBvYmplY3RzLCAyIC0gZ2V0IGluZm9ybWF0aW9uIGFib3V0IGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0cnVjdG9yKHBhcnNlVHlwZTogbnVtYmVyID0gMCkge1xuICAgICAgICAgICAgdGhpcy5wYXJzZVR5cGUgPSBwYXJzZVR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHBhcnNlKHNvdXJjZTogYW55LCByZXZpdmVyOiBhbnkgPSBudWxsLCBzdGFydEZyb206IG51bWJlciA9IDAsIGVuZEF0OiBudW1iZXIgPSAtMSk6IGFueSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBTdHJpbmcoc291cmNlKTtcbiAgICAgICAgICAgIHRoaXMuYXQgPSBzdGFydEZyb207XG4gICAgICAgICAgICB0aGlzLmVuZEF0ID0gZW5kQXQ7XG4gICAgICAgICAgICB0aGlzLmNoID0gJyAnO1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy52YWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy53aGl0ZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKFwiU3ludGF4IGVycm9yXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHJldml2ZXIgZnVuY3Rpb24sIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsXG4gICAgICAgICAgICAvLyBwYXNzaW5nIGVhY2ggbmFtZS92YWx1ZSBwYWlyIHRvIHRoZSByZXZpdmVyIGZ1bmN0aW9uIGZvciBwb3NzaWJsZVxuICAgICAgICAgICAgLy8gdHJhbnNmb3JtYXRpb24sIHN0YXJ0aW5nIHdpdGggYSB0ZW1wb3Jhcnkgcm9vdCBvYmplY3QgdGhhdCBob2xkcyB0aGUgcmVzdWx0XG4gICAgICAgICAgICAvLyBpbiBhbiBlbXB0eSBrZXkuIElmIHRoZXJlIGlzIG5vdCBhIHJldml2ZXIgZnVuY3Rpb24sIHdlIHNpbXBseSByZXR1cm4gdGhlXG4gICAgICAgICAgICAvLyByZXN1bHQuXG5cbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJyA/IChmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH0gKHsgJyc6IHJlc3VsdCB9LCAnJykpIDogcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZXJyb3IobTogc3RyaW5nKSB7XG4gICAgICAgICAgICAvLyBDYWxsIGVycm9yIHdoZW4gc29tZXRoaW5nIGlzIHdyb25nLlxuICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IFN5bnRheEVycm9yKCk7XG4gICAgICAgICAgICBlcnJvci5tZXNzYWdlID0gbTtcbiAgICAgICAgICAgIGVycm9yW1wiYXRcIl0gPSB0aGlzLmF0O1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBuZXh0KGM6IGFueSA9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIElmIGEgYyBwYXJhbWV0ZXIgaXMgcHJvdmlkZWQsIHZlcmlmeSB0aGF0IGl0IG1hdGNoZXMgdGhlIGN1cnJlbnQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgaWYgKGMgJiYgYyAhPT0gdGhpcy5jaCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoXCJFeHBlY3RlZCAnXCIgKyBjICsgXCInIGluc3RlYWQgb2YgJ1wiICsgdGhpcy5jaCArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEdldCB0aGUgdGhpcy5uZXh0IGNoYXJhY3Rlci4gV2hlbiB0aGVyZSBhcmUgbm8gbW9yZSBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlbXB0eSBzdHJpbmcuXG4gICAgICAgICAgICB0aGlzLmNoID0gdGhpcy5jaGFydEF0KCk7XG4gICAgICAgICAgICB0aGlzLmF0ICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHBlZWsoKSB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIHRoaXMubmV4dCBjaGFyYWN0ZXIgd2l0aG91dCBjb25zdW1pbmcgaXQgb3JcbiAgICAgICAgICAgIC8vIGFzc2lnbmluZyBpdCB0byB0aGUgdGhpcy5jaCB2YXJhaWJsZS5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJ0QXQoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGNoYXJ0QXQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lbmRBdCA+IC0xICYmIHRoaXMuYXQgPj0gdGhpcy5lbmRBdCkgcmV0dXJuICcnO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGV4dC5jaGFyQXQodGhpcy5hdCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBpZGVudGlmaWVyKCkge1xuICAgICAgICAgICAgLy8gUGFyc2UgYW4gaWRlbnRpZmllci4gTm9ybWFsbHksIHJlc2VydmVkIHdvcmRzIGFyZSBkaXNhbGxvd2VkIGhlcmUsIGJ1dCB3ZVxuICAgICAgICAgICAgLy8gb25seSB1c2UgdGhpcyBmb3IgdW5xdW90ZWQgb2JqZWN0IGtleXMsIHdoZXJlIHJlc2VydmVkIHdvcmRzIGFyZSBhbGxvd2VkLFxuICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgY2hlY2sgZm9yIHRob3NlIGhlcmUuIFJlZmVyZW5jZXM6XG4gICAgICAgICAgICAvLyAtIGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDcuNlxuICAgICAgICAgICAgLy8gLSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9Db3JlX0phdmFTY3JpcHRfMS41X0d1aWRlL0NvcmVfTGFuZ3VhZ2VfRmVhdHVyZXMjVmFyaWFibGVzXG4gICAgICAgICAgICAvLyAtIGh0dHA6Ly9kb2NzdG9yZS5taWsudWEvb3JlbGx5L3dlYnByb2cvanNjcmlwdC9jaDAyXzA3Lmh0bVxuICAgICAgICAgICAgLy8gVE9ETyBJZGVudGlmaWVycyBjYW4gaGF2ZSBVbmljb2RlIFwibGV0dGVyc1wiIGluIHRoZW07IGFkZCBzdXBwb3J0IGZvciB0aG9zZS5cbiAgICAgICAgICAgIHZhciBrZXkgPSB0aGlzLmNoO1xuXG4gICAgICAgICAgICAvLyBJZGVudGlmaWVycyBtdXN0IHN0YXJ0IHdpdGggYSBsZXR0ZXIsIF8gb3IgJC5cbiAgICAgICAgICAgIGlmICgodGhpcy5jaCAhPT0gJ18nICYmIHRoaXMuY2ggIT09ICckJykgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5jaCA8ICdhJyB8fCB0aGlzLmNoID4gJ3onKSAmJlxuICAgICAgICAgICAgICAgICh0aGlzLmNoIDwgJ0EnIHx8IHRoaXMuY2ggPiAnWicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihcIkJhZCBpZGVudGlmaWVyXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdWJzZXF1ZW50IGNoYXJhY3RlcnMgY2FuIGNvbnRhaW4gZGlnaXRzLlxuICAgICAgICAgICAgd2hpbGUgKHRoaXMubmV4dCgpICYmIChcbiAgICAgICAgICAgICAgICB0aGlzLmNoID09PSAnXycgfHwgdGhpcy5jaCA9PT0gJyQnIHx8XG4gICAgICAgICAgICAgICAgKHRoaXMuY2ggPj0gJ2EnICYmIHRoaXMuY2ggPD0gJ3onKSB8fFxuICAgICAgICAgICAgICAgICh0aGlzLmNoID49ICdBJyAmJiB0aGlzLmNoIDw9ICdaJykgfHxcbiAgICAgICAgICAgICAgICAodGhpcy5jaCA+PSAnMCcgJiYgdGhpcy5jaCA8PSAnOScpKSkge1xuICAgICAgICAgICAgICAgIGtleSArPSB0aGlzLmNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgbnVtYmVyKCkge1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBhIG51bWJlciB2YWx1ZS5cblxuICAgICAgICAgICAgdmFyIG51bWJlcixcbiAgICAgICAgICAgICAgICBzaWduID0gJycsXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgICAgYmFzZSA9IDEwO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJy0nIHx8IHRoaXMuY2ggPT09ICcrJykge1xuICAgICAgICAgICAgICAgIHNpZ24gPSB0aGlzLmNoO1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dCh0aGlzLmNoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3VwcG9ydCBmb3IgSW5maW5pdHkgKGNvdWxkIHR3ZWFrIHRvIGFsbG93IG90aGVyIHdvcmRzKTpcbiAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnSScpIHtcbiAgICAgICAgICAgICAgICBudW1iZXIgPSB0aGlzLndvcmQoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bWJlciAhPT0gJ251bWJlcicgfHwgaXNOYU4obnVtYmVyKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9yKCdVbmV4cGVjdGVkIHdvcmQgZm9yIG51bWJlcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gKHNpZ24gPT09ICctJykgPyAtbnVtYmVyIDogbnVtYmVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdXBwb3J0IGZvciBOYU5cbiAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnTicpIHtcbiAgICAgICAgICAgICAgICBudW1iZXIgPSB0aGlzLndvcmQoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcignZXhwZWN0ZWQgd29yZCB0byBiZSBOYU4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaWdub3JlIHNpZ24gYXMgLU5hTiBhbHNvIGlzIE5hTlxuICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnMCcpIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gdGhpcy5jaDtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJ3gnIHx8IHRoaXMuY2ggPT09ICdYJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gdGhpcy5jaDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSAxNjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY2ggPj0gJzAnICYmIHRoaXMuY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoJ09jdGFsIGxpdGVyYWwnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoYmFzZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmNoID49ICcwJyAmJiB0aGlzLmNoIDw9ICc5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IHRoaXMuY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gJy4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMubmV4dCgpICYmIHRoaXMuY2ggPj0gJzAnICYmIHRoaXMuY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IHRoaXMuY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ggPT09ICdlJyB8fCB0aGlzLmNoID09PSAnRScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSB0aGlzLmNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJy0nIHx8IHRoaXMuY2ggPT09ICcrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSB0aGlzLmNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuY2ggPj0gJzAnICYmIHRoaXMuY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IHRoaXMuY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuY2ggPj0gJzAnICYmIHRoaXMuY2ggPD0gJzknIHx8IHRoaXMuY2ggPj0gJ0EnICYmIHRoaXMuY2ggPD0gJ0YnIHx8IHRoaXMuY2ggPj0gJ2EnICYmIHRoaXMuY2ggPD0gJ2YnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gdGhpcy5jaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2lnbiA9PT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyID0gLXN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyID0gK3N0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihcIkJhZCBudW1iZXJcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcoKSB7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGEgc3RyaW5nIHZhbHVlLlxuXG4gICAgICAgICAgICB2YXIgaGV4LFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgICAgZGVsaW0sICAgICAgLy8gZG91YmxlIHF1b3RlIG9yIHNpbmdsZSBxdW90ZVxuICAgICAgICAgICAgICAgIHVmZmZmO1xuXG4gICAgICAgICAgICAvLyBXaGVuIHBhcnNpbmcgZm9yIHN0cmluZyB2YWx1ZXMsIHdlIG11c3QgbG9vayBmb3IgJyBvciBcIiBhbmQgXFwgY2hhcmFjdGVycy5cblxuICAgICAgICAgICAgaWYgKHRoaXMuY2ggPT09ICdcIicgfHwgdGhpcy5jaCA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgICAgICBkZWxpbSA9IHRoaXMuY2g7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSBkZWxpbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJ3UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWZmZmYgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA0OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGV4ID0gcGFyc2VJbnQodGhpcy5uZXh0KCksIDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShoZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1ZmZmZiA9IHVmZmZmICogMTYgKyBoZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVmZmZmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wZWVrKCkgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIFN1cnZleUpTT041LmVzY2FwZWVbdGhpcy5jaF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IFN1cnZleUpTT041LmVzY2FwZWVbdGhpcy5jaF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmVzY2FwZWQgbmV3bGluZXMgYXJlIGludmFsaWQ7IHNlZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2VlbWsvanNvbjUvaXNzdWVzLzI0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHRoaXMgZmVlbHMgc3BlY2lhbC1jYXNlZDsgYXJlIHRoZXJlIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnZhbGlkIHVuZXNjYXBlZCBjaGFycz9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IHRoaXMuY2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVycm9yKFwiQmFkIHN0cmluZ1wiKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGlubGluZUNvbW1lbnQoKSB7XG5cbiAgICAgICAgICAgIC8vIFNraXAgYW4gaW5saW5lIGNvbW1lbnQsIGFzc3VtaW5nIHRoaXMgaXMgb25lLiBUaGUgY3VycmVudCBjaGFyYWN0ZXIgc2hvdWxkXG4gICAgICAgICAgICAvLyBiZSB0aGUgc2Vjb25kIC8gY2hhcmFjdGVyIGluIHRoZSAvLyBwYWlyIHRoYXQgYmVnaW5zIHRoaXMgaW5saW5lIGNvbW1lbnQuXG4gICAgICAgICAgICAvLyBUbyBmaW5pc2ggdGhlIGlubGluZSBjb21tZW50LCB3ZSBsb29rIGZvciBhIG5ld2xpbmUgb3IgdGhlIGVuZCBvZiB0aGUgdGV4dC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuY2ggIT09ICcvJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoXCJOb3QgYW4gaW5saW5lIGNvbW1lbnRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJ1xcbicgfHwgdGhpcy5jaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlICh0aGlzLmNoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGJsb2NrQ29tbWVudCgpIHtcblxuICAgICAgICAgICAgLy8gU2tpcCBhIGJsb2NrIGNvbW1lbnQsIGFzc3VtaW5nIHRoaXMgaXMgb25lLiBUaGUgY3VycmVudCBjaGFyYWN0ZXIgc2hvdWxkIGJlXG4gICAgICAgICAgICAvLyB0aGUgKiBjaGFyYWN0ZXIgaW4gdGhlIC8qIHBhaXIgdGhhdCBiZWdpbnMgdGhpcyBibG9jayBjb21tZW50LlxuICAgICAgICAgICAgLy8gVG8gZmluaXNoIHRoZSBibG9jayBjb21tZW50LCB3ZSBsb29rIGZvciBhbiBlbmRpbmcgKi8gcGFpciBvZiBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgLy8gYnV0IHdlIGFsc28gd2F0Y2ggZm9yIHRoZSBlbmQgb2YgdGV4dCBiZWZvcmUgdGhlIGNvbW1lbnQgaXMgdGVybWluYXRlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuY2ggIT09ICcqJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoXCJOb3QgYSBibG9jayBjb21tZW50XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuY2ggPT09ICcqJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJyonKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ggPT09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlICh0aGlzLmNoKTtcblxuICAgICAgICAgICAgdGhpcy5lcnJvcihcIlVudGVybWluYXRlZCBibG9jayBjb21tZW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY29tbWVudCgpIHtcblxuICAgICAgICAgICAgLy8gU2tpcCBhIGNvbW1lbnQsIHdoZXRoZXIgaW5saW5lIG9yIGJsb2NrLWxldmVsLCBhc3N1bWluZyB0aGlzIGlzIG9uZS5cbiAgICAgICAgICAgIC8vIENvbW1lbnRzIGFsd2F5cyBiZWdpbiB3aXRoIGEgLyBjaGFyYWN0ZXIuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNoICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKFwiTm90IGEgY29tbWVudFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5uZXh0KCcvJyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlubGluZUNvbW1lbnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jaCA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja0NvbW1lbnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihcIlVucmVjb2duaXplZCBjb21tZW50XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgd2hpdGUoKSB7XG5cbiAgICAgICAgICAgIC8vIFNraXAgd2hpdGVzcGFjZSBhbmQgY29tbWVudHMuXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgd2UncmUgZGV0ZWN0aW5nIGNvbW1lbnRzIGJ5IG9ubHkgYSBzaW5nbGUgLyBjaGFyYWN0ZXIuXG4gICAgICAgICAgICAvLyBUaGlzIHdvcmtzIHNpbmNlIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYXJlIG5vdCB2YWxpZCBKU09OKDUpLCBidXQgdGhpcyB3aWxsXG4gICAgICAgICAgICAvLyBicmVhayBpZiB0aGVyZSBhcmUgb3RoZXIgdmFsaWQgdmFsdWVzIHRoYXQgYmVnaW4gd2l0aCBhIC8gY2hhcmFjdGVyIVxuXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5jaCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChTdXJ2ZXlKU09ONS53cy5pbmRleE9mKHRoaXMuY2gpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHdvcmQoKTogYW55IHtcblxuICAgICAgICAgICAgLy8gdHJ1ZSwgZmFsc2UsIG9yIG51bGwuXG5cbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5jaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ3QnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCdyJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgndScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgY2FzZSAnZic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnZicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCdsJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgncycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ24nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCd1Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnbCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ2wnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgY2FzZSAnSSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnSScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ24nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCdmJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnaScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ24nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCdpJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgndCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ3knKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgICAgICAgICAgIGNhc2UgJ04nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ04nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnTicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lcnJvcihcIlVuZXhwZWN0ZWQgJ1wiICsgdGhpcy5jaCArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGFycmF5KCkge1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBhbiBhcnJheSB2YWx1ZS5cblxuICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnWycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ1snKTtcbiAgICAgICAgICAgICAgICB0aGlzLndoaXRlKCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ggPT09ICddJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0KCddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXk7ICAgLy8gUG90ZW50aWFsbHkgZW1wdHkgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBFUzUgYWxsb3dzIG9taXR0aW5nIGVsZW1lbnRzIGluIGFycmF5cywgZS5nLiBbLF0gYW5kXG4gICAgICAgICAgICAgICAgICAgIC8vIFssbnVsbF0uIFdlIGRvbid0IGFsbG93IHRoaXMgaW4gSlNPTjUuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoXCJNaXNzaW5nIGFycmF5IGVsZW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMudmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aGl0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGNvbW1hIGFmdGVyIHRoaXMgdmFsdWUsIHRoaXMgbmVlZHMgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYmUgdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoICE9PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndoaXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lcnJvcihcIkJhZCBhcnJheVwiKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIG9iamVjdCgpIHtcblxuICAgICAgICAgICAgLy8gUGFyc2UgYW4gb2JqZWN0IHZhbHVlLlxuXG4gICAgICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgICAgIHN0YXJ0LFxuICAgICAgICAgICAgICAgIGlzRmlyc3RQcm9wZXJ0eSA9IHRydWUsXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0ge307XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJzZVR5cGUgPiAwKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0W1N1cnZleUpTT041LnBvc2l0aW9uTmFtZV0gPSB7IHN0YXJ0OiB0aGlzLmF0IC0gMSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuY2ggPT09ICd7Jykge1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dCgneycpO1xuICAgICAgICAgICAgICAgIHRoaXMud2hpdGUoKTtcbiAgICAgICAgICAgICAgICBzdGFydCA9IHRoaXMuYXQgLSAxO1xuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoID09PSAnfScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlVHlwZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RbU3VydmV5SlNPTjUucG9zaXRpb25OYW1lXS5lbmQgPSBzdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDsgICAvLyBQb3RlbnRpYWxseSBlbXB0eSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEtleXMgY2FuIGJlIHVucXVvdGVkLiBJZiB0aGV5IGFyZSwgdGhleSBuZWVkIHRvIGJlXG4gICAgICAgICAgICAgICAgICAgIC8vIHZhbGlkIEpTIGlkZW50aWZpZXJzLlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCA9PT0gJ1wiJyB8fCB0aGlzLmNoID09PSBcIidcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0gdGhpcy5zdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IHRoaXMuaWRlbnRpZmllcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aGl0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJzZVR5cGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RbU3VydmV5SlNPTjUucG9zaXRpb25OYW1lXVtrZXldID0geyBzdGFydDogc3RhcnQsIHZhbHVlU3RhcnQ6IHRoaXMuYXQgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJzonKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0gPSB0aGlzLnZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlVHlwZSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gdGhpcy5hdCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RbU3VydmV5SlNPTjUucG9zaXRpb25OYW1lXVtrZXldLnZhbHVlRW5kID0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RbU3VydmV5SlNPTjUucG9zaXRpb25OYW1lXVtrZXldLmVuZCA9IHN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2hpdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBjb21tYSBhZnRlciB0aGlzIHBhaXIsIHRoaXMgbmVlZHMgdG8gYmVcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGVuZCBvZiB0aGUgb2JqZWN0LlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaCAhPT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJzZVR5cGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W1N1cnZleUpTT041LnBvc2l0aW9uTmFtZV1ba2V5XS52YWx1ZUVuZC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFtTdXJ2ZXlKU09ONS5wb3NpdGlvbk5hbWVdW2tleV0uZW5kLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJzZVR5cGUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W1N1cnZleUpTT041LnBvc2l0aW9uTmFtZV0uZW5kID0gdGhpcy5hdCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoJ30nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyc2VUeXBlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W1N1cnZleUpTT041LnBvc2l0aW9uTmFtZV1ba2V5XS52YWx1ZUVuZC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0UHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RbU3VydmV5SlNPTjUucG9zaXRpb25OYW1lXVtrZXldLmVuZC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndoaXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlzRmlyc3RQcm9wZXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZXJyb3IoXCJCYWQgb2JqZWN0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgdmFsdWUoKTogYW55IHtcblxuICAgICAgICAgICAgLy8gUGFyc2UgYSBKU09OIHZhbHVlLiBJdCBjb3VsZCBiZSBhbiBvYmplY3QsIGFuIGFycmF5LCBhIHN0cmluZywgYSBudW1iZXIsXG4gICAgICAgICAgICAvLyBvciBhIHdvcmQuXG5cbiAgICAgICAgICAgIHRoaXMud2hpdGUoKTtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5jaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vYmplY3QoKTtcbiAgICAgICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm51bWJlcigpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoID49ICcwJyAmJiB0aGlzLmNoIDw9ICc5JyA/IHRoaXMubnVtYmVyKCkgOiB0aGlzLndvcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgcmVwbGFjZXI6IGFueTtcbiAgICAgICAgcHJpdmF0ZSBpbmRlbnRTdHI6IHN0cmluZztcbiAgICAgICAgcHJpdmF0ZSBvYmpTdGFjaztcblxuICAgICAgICBwdWJsaWMgc3RyaW5naWZ5KG9iajogYW55LCByZXBsYWNlcjogYW55ID0gbnVsbCwgc3BhY2U6IGFueSA9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlciAmJiAodHlwZW9mIChyZXBsYWNlcikgIT09IFwiZnVuY3Rpb25cIiAmJiAhdGhpcy5pc0FycmF5KHJlcGxhY2VyKSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcGxhY2VyIG11c3QgYmUgYSBmdW5jdGlvbiBvciBhbiBhcnJheScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgdGhpcy5pbmRlbnRTdHIgPSB0aGlzLmdldEluZGVudChzcGFjZSk7XG4gICAgICAgICAgICB0aGlzLm9ialN0YWNrID0gW107XG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhc2UuLi53aGVuIHVuZGVmaW5lZCBpcyB1c2VkIGluc2lkZSBvZlxuICAgICAgICAgICAgLy8gYSBjb21wb3VuZCBvYmplY3QvYXJyYXksIHJldHVybiBudWxsLlxuICAgICAgICAgICAgLy8gYnV0IHdoZW4gdG9wLWxldmVsLCByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgICAgICB2YXIgdG9wTGV2ZWxIb2xkZXIgPSB7IFwiXCI6IG9iaiB9O1xuICAgICAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVwbGFjZWRWYWx1ZU9yVW5kZWZpbmVkKHRvcExldmVsSG9sZGVyLCAnJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFN0cmluZ2lmeSh0b3BMZXZlbEhvbGRlciwgJycsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0SW5kZW50KHNwYWNlOiBhbnkpOiBzdHJpbmcge1xuICAgICAgICAgICAgaWYgKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzcGFjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3BhY2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BhY2UgPT09IFwibnVtYmVyXCIgJiYgc3BhY2UgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYWtlSW5kZW50KFwiIFwiLCBzcGFjZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRSZXBsYWNlZFZhbHVlT3JVbmRlZmluZWQoaG9sZGVyOiBhbnksIGtleTogYW55LCBpc1RvcExldmVsOiBib29sZWFuKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgdmFsdWUgd2l0aCBpdHMgdG9KU09OIHZhbHVlIGZpcnN0LCBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLnRvSlNPTiAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgdXNlci1zdXBwbGllZCByZXBsYWNlciBpZiBhIGZ1bmN0aW9uLCBjYWxsIGl0LiBJZiBpdCdzIGFuIGFycmF5LCBjaGVjayBvYmplY3RzJyBzdHJpbmcga2V5cyBmb3JcbiAgICAgICAgICAgIC8vIHByZXNlbmNlIGluIHRoZSBhcnJheSAocmVtb3ZpbmcgdGhlIGtleS92YWx1ZSBwYWlyIGZyb20gdGhlIHJlc3VsdGluZyBKU09OIGlmIHRoZSBrZXkgaXMgbWlzc2luZykuXG4gICAgICAgICAgICBpZiAodHlwZW9mICh0aGlzLnJlcGxhY2VyKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZXIuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlcGxhY2VyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzVG9wTGV2ZWwgfHwgdGhpcy5pc0FycmF5KGhvbGRlcikgfHwgdGhpcy5yZXBsYWNlci5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgaXNXb3JkQ2hhcihjaGFyOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHJldHVybiAoY2hhciA+PSAnYScgJiYgY2hhciA8PSAneicpIHx8XG4gICAgICAgICAgICAgICAgKGNoYXIgPj0gJ0EnICYmIGNoYXIgPD0gJ1onKSB8fFxuICAgICAgICAgICAgICAgIChjaGFyID49ICcwJyAmJiBjaGFyIDw9ICc5JykgfHxcbiAgICAgICAgICAgICAgICBjaGFyID09PSAnXycgfHwgY2hhciA9PT0gJyQnO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBpc1dvcmRTdGFydChjaGFyOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHJldHVybiAoY2hhciA+PSAnYScgJiYgY2hhciA8PSAneicpIHx8XG4gICAgICAgICAgICAgICAgKGNoYXIgPj0gJ0EnICYmIGNoYXIgPD0gJ1onKSB8fFxuICAgICAgICAgICAgICAgIGNoYXIgPT09ICdfJyB8fCBjaGFyID09PSAnJCc7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGlzV29yZChrZXk6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzV29yZFN0YXJ0KGtleVswXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IDEsIGxlbmd0aCA9IGtleS5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1dvcmRDaGFyKGtleVtpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBwb2x5ZmlsbHNcbiAgICAgICAgcHJpdmF0ZSBpc0FycmF5KG9iajogYW55KTogYm9vbGVhbiB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KG9iaik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgaXNEYXRlKG9iajogYW55KTogYm9vbGVhbiB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgaXNOYU4odmFsOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgIT09IHZhbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBjaGVja0ZvckNpcmN1bGFyKG9iajogYW55KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub2JqU3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vYmpTdGFja1tpXSA9PT0gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDb252ZXJ0aW5nIGNpcmN1bGFyIHN0cnVjdHVyZSB0byBKU09OXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIG1ha2VJbmRlbnQoc3RyOiBzdHJpbmcsIG51bTogbnVtYmVyLCBub05ld0xpbmU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGluZGVudGF0aW9uIG5vIG1vcmUgdGhhbiAxMCBjaGFyc1xuICAgICAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAxMCkge1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgMTApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW5kZW50ID0gbm9OZXdMaW5lID8gXCJcIiA6IFwiXFxuXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW5kZW50ICs9IHN0cjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluZGVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvcGllZCBmcm9tIENyb2tmb3JkJ3MgaW1wbGVtZW50YXRpb24gb2YgSlNPTlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2RvdWdsYXNjcm9ja2ZvcmQvSlNPTi1qcy9ibG9iL2UzOWRiNGI3ZTYyNDlmMDRhMTk1ZTdkZDA4NDBlNjEwY2M5ZTk0MWUvanNvbjIuanMjTDE5NVxuICAgICAgICAvLyBCZWdpblxuICAgICAgICBwcml2YXRlIHN0YXRpYyBjeCA9IC9bXFx1MDAwMFxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBlc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHg5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBtZXRhID0geyAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAgICAgJ1xcYic6ICdcXFxcYicsXG4gICAgICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAgICAgJ1xcZic6ICdcXFxcZicsXG4gICAgICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgICAgICdcIic6ICdcXFxcXCInLFxuICAgICAgICAgICAgJ1xcXFwnOiAnXFxcXFxcXFwnXG4gICAgICAgIH07XG4gICAgICAgIHByaXZhdGUgZXNjYXBlU3RyaW5nKHN0cjogc3RyaW5nKSB7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbiAgICAgICAgICAgIC8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4gICAgICAgICAgICAvLyBPdGhlcndpc2Ugd2UgbXVzdCBhbHNvIHJlcGxhY2UgdGhlIG9mZmVuZGluZyBjaGFyYWN0ZXJzIHdpdGggc2FmZSBlc2NhcGVcbiAgICAgICAgICAgIC8vIHNlcXVlbmNlcy5cbiAgICAgICAgICAgIFN1cnZleUpTT041LmVzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgcmV0dXJuIFN1cnZleUpTT041LmVzY2FwYWJsZS50ZXN0KHN0cikgPyAnXCInICsgc3RyLnJlcGxhY2UoU3VydmV5SlNPTjUuZXNjYXBhYmxlLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgIHZhciBjID0gU3VydmV5SlNPTjUubWV0YVthXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGMgPT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgICAgICAgICAgYyA6XG4gICAgICAgICAgICAgICAgICAgICdcXFxcdScgKyAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICAgICAgfSkgKyAnXCInIDogJ1wiJyArIHN0ciArICdcIic7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5kXG5cbiAgICAgICAgcHJpdmF0ZSBpbnRlcm5hbFN0cmluZ2lmeShob2xkZXI6IGFueSwga2V5OiBhbnksIGlzVG9wTGV2ZWw6IGJvb2xlYW4pIHtcbiAgICAgICAgICAgIHZhciBidWZmZXIsIHJlcztcblxuICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgdmFsdWUsIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgdmFyIG9ial9wYXJ0ID0gdGhpcy5nZXRSZXBsYWNlZFZhbHVlT3JVbmRlZmluZWQoaG9sZGVyLCBrZXksIGlzVG9wTGV2ZWwpO1xuXG4gICAgICAgICAgICBpZiAob2JqX3BhcnQgJiYgIXRoaXMuaXNEYXRlKG9ial9wYXJ0KSkge1xuICAgICAgICAgICAgICAgIC8vIHVuYm94IG9iamVjdHNcbiAgICAgICAgICAgICAgICAvLyBkb24ndCB1bmJveCBkYXRlcywgc2luY2Ugd2lsbCB0dXJuIGl0IGludG8gbnVtYmVyXG4gICAgICAgICAgICAgICAgb2JqX3BhcnQgPSBvYmpfcGFydC52YWx1ZU9mKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGVvZiBvYmpfcGFydCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmpfcGFydC50b1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4ob2JqX3BhcnQpIHx8ICFpc0Zpbml0ZShvYmpfcGFydCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqX3BhcnQudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXNjYXBlU3RyaW5nKG9ial9wYXJ0LnRvU3RyaW5nKCkpO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqX3BhcnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzQXJyYXkob2JqX3BhcnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yQ2lyY3VsYXIob2JqX3BhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gXCJbXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9ialN0YWNrLnB1c2gob2JqX3BhcnQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ial9wYXJ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gdGhpcy5pbnRlcm5hbFN0cmluZ2lmeShvYmpfcGFydCwgaSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSB0aGlzLm1ha2VJbmRlbnQodGhpcy5pbmRlbnRTdHIsIHRoaXMub2JqU3RhY2subGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzID09PSBudWxsIHx8IHR5cGVvZiByZXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IFwibnVsbFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpIDwgb2JqX3BhcnQubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gXCIsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluZGVudFN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9ialN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IHRoaXMubWFrZUluZGVudCh0aGlzLmluZGVudFN0ciwgdGhpcy5vYmpTdGFjay5sZW5ndGgsIHRydWUpICsgXCJdXCI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yQ2lyY3VsYXIob2JqX3BhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gXCJ7XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9uRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2JqU3RhY2sucHVzaChvYmpfcGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9ial9wYXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9ial9wYXJ0Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuaW50ZXJuYWxTdHJpbmdpZnkob2JqX3BhcnQsIHByb3AsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNUb3BMZXZlbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gdGhpcy5tYWtlSW5kZW50KHRoaXMuaW5kZW50U3RyLCB0aGlzLm9ialN0YWNrLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub25FbXB0eSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcEtleSA9IHRoaXMuaXNXb3JkKHByb3ApID8gcHJvcCA6IHRoaXMuZXNjYXBlU3RyaW5nKHByb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IHByb3BLZXkgKyBcIjpcIiArICh0aGlzLmluZGVudFN0ciA/ICcgJyA6ICcnKSArIHZhbHVlICsgXCIsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9ialN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vbkVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyLnN1YnN0cmluZygwLCBidWZmZXIubGVuZ3RoIC0gMSkgKyB0aGlzLm1ha2VJbmRlbnQodGhpcy5pbmRlbnRTdHIsIHRoaXMub2JqU3RhY2subGVuZ3RoKSArIFwifVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSAne30nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLy8gZnVuY3Rpb25zIGFuZCB1bmRlZmluZWQgc2hvdWxkIGJlIGlnbm9yZWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIvKiFcbiogc3VydmV5anMgRWRpdG9yIHYwLjkuMTJcbiogKGMpIEFuZHJldyBUZWxub3YgLSBodHRwOi8vc3VydmV5anMub3JnL2J1aWxkZXIvXG4qIEdpdGh1YiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXd0ZWxub3Yvc3VydmV5LmpzLmVkaXRvclxuKi9cblxubW9kdWxlIFN1cnZleUVkaXRvciB7XG5cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5T2JqZWN0SXRlbSB7XG4gICAgICAgIHB1YmxpYyB2YWx1ZTogU3VydmV5LkJhc2U7XG4gICAgICAgIHB1YmxpYyB0ZXh0OiBhbnk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleU9iamVjdHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGludGVuZDogc3RyaW5nID0gXCIuLi5cIjtcbiAgICAgICAgc3VydmV5VmFsdWU6IFN1cnZleS5TdXJ2ZXk7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIGtvT2JqZWN0czogYW55LCBwdWJsaWMga29TZWxlY3RlZDogYW55KSB7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBzdXJ2ZXkoKTogU3VydmV5LlN1cnZleSB7IHJldHVybiB0aGlzLnN1cnZleVZhbHVlOyB9XG4gICAgICAgIHB1YmxpYyBzZXQgc3VydmV5KHZhbHVlOiBTdXJ2ZXkuU3VydmV5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdXJ2ZXkgPT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc3VydmV5VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMucmVidWlsZCgpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBhZGRQYWdlKHBhZ2U6IFN1cnZleS5QYWdlKSB7XG4gICAgICAgICAgICB2YXIgcGFnZUl0ZW0gPSB0aGlzLmNyZWF0ZVBhZ2UocGFnZSk7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnN1cnZleS5wYWdlcy5pbmRleE9mKHBhZ2UpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwcmV2UGFnZSA9IHRoaXMuc3VydmV5LnBhZ2VzW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLmdldEl0ZW1JbmRleChwcmV2UGFnZSkgKyAxO1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IHByZXZQYWdlLnF1ZXN0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gMTsgLy8wIC0gU3VydmV5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFkZEl0ZW0ocGFnZUl0ZW0sIGluZGV4KTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhZ2UucXVlc3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLmNyZWF0ZVF1ZXN0aW9uKHBhZ2UucXVlc3Rpb25zW2ldKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEl0ZW0oaXRlbSwgaW5kZXggKyBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMua29TZWxlY3RlZChwYWdlSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGFkZFF1ZXN0aW9uKHBhZ2U6IFN1cnZleS5QYWdlLCBxdWVzdGlvbjogU3VydmV5LlF1ZXN0aW9uQmFzZSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5nZXRJdGVtSW5kZXgocGFnZSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCAwKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb25JbmRleCA9IHBhZ2UucXVlc3Rpb25zLmluZGV4T2YocXVlc3Rpb24pICsgMTtcbiAgICAgICAgICAgIGluZGV4ICs9IHF1ZXN0aW9uSW5kZXg7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuY3JlYXRlUXVlc3Rpb24ocXVlc3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKGl0ZW0sIGluZGV4KTtcbiAgICAgICAgICAgIHRoaXMua29TZWxlY3RlZChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc2VsZWN0T2JqZWN0KG9iajogU3VydmV5LkJhc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmpzID0gdGhpcy5rb09iamVjdHMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChvYmpzW2ldLnZhbHVlID09IG9iaikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWQob2Jqc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHJlbW92ZU9iamVjdChvYmo6IFN1cnZleS5CYXNlKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmdldEl0ZW1JbmRleChvYmopO1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGNvdW50VG9SZW1vdmUgPSAxO1xuICAgICAgICAgICAgaWYgKFN1cnZleUhlbHBlci5nZXRPYmplY3RUeXBlKG9iaikgPT0gT2JqVHlwZS5QYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZ2U6IFN1cnZleS5QYWdlID0gPFN1cnZleS5QYWdlPm9iajtcbiAgICAgICAgICAgICAgICBjb3VudFRvUmVtb3ZlICs9IHBhZ2UucXVlc3Rpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMua29PYmplY3RzLnNwbGljZShpbmRleCwgY291bnRUb1JlbW92ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIG5hbWVDaGFuZ2VkKG9iajogU3VydmV5LkJhc2UpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KG9iaik7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCAwKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmtvT2JqZWN0cygpW2luZGV4XS50ZXh0KHRoaXMuZ2V0VGV4dChvYmopKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc2VsZWN0TmV4dFF1ZXN0aW9uKGlzVXA6IGJvb2xlYW4pIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0U2VsZWN0ZWRRdWVzdGlvbigpO1xuICAgICAgICAgICAgdmFyIGl0ZW1JbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KHF1ZXN0aW9uKTtcbiAgICAgICAgICAgIGlmIChpdGVtSW5kZXggPCAwKSByZXR1cm4gcXVlc3Rpb247XG4gICAgICAgICAgICB2YXIgb2JqcyA9IHRoaXMua29PYmplY3RzKCk7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbUluZGV4ID0gaXRlbUluZGV4ICsgKGlzVXAgPyAtMSA6IDEpO1xuICAgICAgICAgICAgaWYgKG5ld0l0ZW1JbmRleCA8IG9ianMubGVuZ3RoICYmIFN1cnZleUhlbHBlci5nZXRPYmplY3RUeXBlKG9ianNbbmV3SXRlbUluZGV4XS52YWx1ZSkgPT0gT2JqVHlwZS5RdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIGl0ZW1JbmRleCA9IG5ld0l0ZW1JbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3SXRlbUluZGV4ID0gaXRlbUluZGV4O1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXdJdGVtSW5kZXggPCBvYmpzLmxlbmd0aCAmJiBTdXJ2ZXlIZWxwZXIuZ2V0T2JqZWN0VHlwZShvYmpzW25ld0l0ZW1JbmRleF0udmFsdWUpID09IE9ialR5cGUuUXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUluZGV4ID0gbmV3SXRlbUluZGV4O1xuICAgICAgICAgICAgICAgICAgICBuZXdJdGVtSW5kZXggKz0gKGlzVXAgPyAxIDogLTEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMua29TZWxlY3RlZChvYmpzW2l0ZW1JbmRleF0pO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0U2VsZWN0ZWRRdWVzdGlvbigpOiBTdXJ2ZXkuUXVlc3Rpb25CYXNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5rb1NlbGVjdGVkKCkpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdmFyIG9iaiA9IHRoaXMua29TZWxlY3RlZCgpLnZhbHVlO1xuICAgICAgICAgICAgaWYgKCFvYmopIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIFN1cnZleUhlbHBlci5nZXRPYmplY3RUeXBlKG9iaikgPT0gT2JqVHlwZS5RdWVzdGlvbiA/IDxTdXJ2ZXkuUXVlc3Rpb25CYXNlPihvYmopIDogbnVsbDtcblxuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgYWRkSXRlbShpdGVtOiBTdXJ2ZXlPYmplY3RJdGVtLCBpbmRleDogbnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiB0aGlzLmtvT2JqZWN0cygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMua29PYmplY3RzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMua29PYmplY3RzLnNwbGljZShpbmRleCwgMCwgaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSByZWJ1aWxkKCkge1xuICAgICAgICAgICAgdmFyIG9ianMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1cnZleSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rb09iamVjdHMob2Jqcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9ianMucHVzaCh0aGlzLmNyZWF0ZUl0ZW0odGhpcy5zdXJ2ZXksIFwiU3VydmV5XCIpKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdXJ2ZXkucGFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFnZSA9IDxTdXJ2ZXkuUGFnZT50aGlzLnN1cnZleS5wYWdlc1tpXTtcbiAgICAgICAgICAgICAgICBvYmpzLnB1c2godGhpcy5jcmVhdGVQYWdlKHBhZ2UpKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhZ2UucXVlc3Rpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ianMucHVzaCh0aGlzLmNyZWF0ZVF1ZXN0aW9uKHBhZ2UucXVlc3Rpb25zW2pdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5rb09iamVjdHMob2Jqcyk7XG4gICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWQodGhpcy5zdXJ2ZXkpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlUGFnZShwYWdlOiBTdXJ2ZXkuUGFnZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlSXRlbShwYWdlLCB0aGlzLmdldFRleHQocGFnZSkpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlUXVlc3Rpb24ocXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkJhc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUl0ZW0ocXVlc3Rpb24sIHRoaXMuZ2V0VGV4dChxdWVzdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlSXRlbSh2YWx1ZTogU3VydmV5LkJhc2UsIHRleHQ6IHN0cmluZykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBuZXcgU3VydmV5T2JqZWN0SXRlbSgpO1xuICAgICAgICAgICAgaXRlbS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgaXRlbS50ZXh0ID0ga28ub2JzZXJ2YWJsZSh0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0SXRlbUluZGV4KHZhbHVlOiBTdXJ2ZXkuQmFzZSk6IG51bWJlciB7XG4gICAgICAgICAgICB2YXIgb2JqcyA9IHRoaXMua29PYmplY3RzKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAob2Jqc1tpXS52YWx1ZSA9PSB2YWx1ZSkgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRUZXh0KG9iajogU3VydmV5LkJhc2UpOiBzdHJpbmcge1xuICAgICAgICAgICAgdmFyIGludGVuZCA9IFN1cnZleU9iamVjdHMuaW50ZW5kO1xuICAgICAgICAgICAgaWYgKFN1cnZleUhlbHBlci5nZXRPYmplY3RUeXBlKG9iaikgIT0gT2JqVHlwZS5QYWdlKSB7XG4gICAgICAgICAgICAgICAgaW50ZW5kICs9IFN1cnZleU9iamVjdHMuaW50ZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGludGVuZCArIFN1cnZleUhlbHBlci5nZXRPYmplY3ROYW1lKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInByb3BlcnR5RWRpdG9yQmFzZS50c1wiIC8+XG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlNb2RhbEVkaXRvciBleHRlbmRzIFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZSB7XG4gICAgICAgIHB1YmxpYyBvYmplY3Q6IGFueTtcbiAgICAgICAgcHVibGljIHRpdGxlOiBhbnk7XG4gICAgICAgIHB1YmxpYyBvbkFwcGx5Q2xpY2s6IGFueTtcbiAgICAgICAgcHVibGljIG9uUmVzZXRDbGljazogYW55O1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKClcbiAgICAgICAgICAgIHRoaXMudGl0bGUgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBzZWxmLm9uQXBwbHlDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5hcHBseSgpOyB9O1xuICAgICAgICAgICAgc2VsZi5vblJlc2V0Q2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYucmVzZXQoKTsgfTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgc2V0VGl0bGUodmFsdWU6IHN0cmluZykgeyB0aGlzLnRpdGxlKHZhbHVlKTsgfVxuICAgICAgICBwdWJsaWMgaGFzRXJyb3IoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICBwcm90ZWN0ZWQgb25CZWZvcmVBcHBseSgpIHsgfVxuICAgICAgICBwcml2YXRlIHJlc2V0KCkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIHNldE9iamVjdCh2YWx1ZTogYW55KSB7IHRoaXMub2JqZWN0ID0gdmFsdWU7IH1cbiAgICAgICAgcHVibGljIGdldCBpc0VkaXRhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgcHJpdmF0ZSBhcHBseSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0Vycm9yKCkpIHJldHVyblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUFwcGx5KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5vbkNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2hhbmdlZCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlUZXh0RWRpdG9yIGV4dGVuZHMgU3VydmV5UHJvcGVydHlNb2RhbEVkaXRvciB7XG4gICAgICAgIHB1YmxpYyBrb1ZhbHVlOiBhbnk7XG5cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5rb1ZhbHVlID0ga28ub2JzZXJ2YWJsZSgpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgZWRpdG9yVHlwZSgpOiBzdHJpbmcgeyByZXR1cm4gXCJ0ZXh0XCI7IH1cbiAgICAgICAgcHVibGljIGdldCBpc0VkaXRhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICBwdWJsaWMgZ2V0VmFsdWVUZXh0KHZhbHVlOiBhbnkpOiBzdHJpbmcge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB2YXIgc3RyID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDIwKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cigwLCAyMCkgKyBcIi4uLlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgb25WYWx1ZUNoYW5nZWQoKSB7XG4gICAgICAgICAgICB0aGlzLmtvVmFsdWUodGhpcy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIG9uQmVmb3JlQXBwbHkoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFZhbHVlQ29yZSh0aGlzLmtvVmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleVByb3BlcnR5SHRtbEVkaXRvciBleHRlbmRzIFN1cnZleVByb3BlcnR5VGV4dEVkaXRvciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IGVkaXRvclR5cGUoKTogc3RyaW5nIHsgcmV0dXJuIFwiaHRtbFwiOyB9XG4gICAgfVxuICAgIFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZS5yZWdpc3RlckVkaXRvcihcInRleHRcIiwgZnVuY3Rpb24gKCk6IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZSB7IHJldHVybiBuZXcgU3VydmV5UHJvcGVydHlUZXh0RWRpdG9yKCk7IH0pO1xuICAgIFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZS5yZWdpc3RlckVkaXRvcihcImh0bWxcIiwgZnVuY3Rpb24gKCk6IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZSB7IHJldHVybiBuZXcgU3VydmV5UHJvcGVydHlIdG1sRWRpdG9yKCk7IH0pO1xuIFxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInByb3BlcnR5RWRpdG9yQmFzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlNb2RhbEVkaXRvci50c1wiIC8+XG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlJdGVtc0VkaXRvciBleHRlbmRzIFN1cnZleVByb3BlcnR5TW9kYWxFZGl0b3Ige1xuICAgICAgICBwdWJsaWMga29JdGVtczogYW55O1xuICAgICAgICBwdWJsaWMgb25EZWxldGVDbGljazogYW55O1xuICAgICAgICBwdWJsaWMgb25BZGRDbGljazogYW55O1xuICAgICAgICBwdWJsaWMgb25DbGVhckNsaWNrOiBhbnk7XG5cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5rb0l0ZW1zID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBzZWxmLm9uRGVsZXRlQ2xpY2sgPSBmdW5jdGlvbiAoaXRlbSkgeyBzZWxmLmtvSXRlbXMucmVtb3ZlKGl0ZW0pOyB9O1xuICAgICAgICAgICAgc2VsZi5vbkNsZWFyQ2xpY2sgPSBmdW5jdGlvbiAoaXRlbSkgeyBzZWxmLmtvSXRlbXMucmVtb3ZlQWxsKCk7IH07XG4gICAgICAgICAgICBzZWxmLm9uQWRkQ2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYuQWRkSXRlbSgpOyB9O1xuXG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldFZhbHVlVGV4dCh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSB2YWx1ZSA/IHZhbHVlLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhcInBlLml0ZW1zXCIpW1wiZm9ybWF0XCJdKGxlbik7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGdldENvcnJlY3RlZFZhbHVlKHZhbHVlOiBhbnkpOiBhbnkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwgfHwgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB2YWx1ZSA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBBZGRJdGVtKCkge1xuICAgICAgICAgICAgdGhpcy5rb0l0ZW1zLnB1c2godGhpcy5jcmVhdGVOZXdFZGl0b3JJdGVtKCkpO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBvblZhbHVlQ2hhbmdlZCgpIHtcbiAgICAgICAgICAgIHRoaXMua29JdGVtcyh0aGlzLmdldEl0ZW1zRnJvbVZhbHVlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBnZXRJdGVtc0Zyb21WYWx1ZSgpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHRoaXMuY3JlYXRlRWRpdG9ySXRlbSh2YWx1ZVtpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBvbkJlZm9yZUFwcGx5KCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgICAgICB2YXIgaW50ZXJuYWxJdGVtcyA9IHRoaXMua29JdGVtcygpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnRlcm5hbEl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh0aGlzLmNyZWF0ZUl0ZW1Gcm9tRWRpdG9ySXRlbShpbnRlcm5hbEl0ZW1zW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFZhbHVlQ29yZShpdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZU5ld0VkaXRvckl0ZW0oKTogYW55IHsgdGhyb3cgXCJPdmVycmlkZSAnY3JlYXRlTmV3RWRpdG9ySXRlbScgbWV0aG9kXCI7IH1cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUVkaXRvckl0ZW0oaXRlbTogYW55KSB7IHJldHVybiBpdGVtOyB9XG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJdGVtRnJvbUVkaXRvckl0ZW0oZWRpdG9ySXRlbTogYW55KSB7ICByZXR1cm4gZWRpdG9ySXRlbTsgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInByb3BlcnR5RWRpdG9yQmFzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlNb2RhbEVkaXRvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlJdGVtc0VkaXRvci50c1wiIC8+XG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlJdGVtVmFsdWVzRWRpdG9yIGV4dGVuZHMgU3VydmV5UHJvcGVydHlJdGVtc0VkaXRvciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IGVkaXRvclR5cGUoKTogc3RyaW5nIHsgcmV0dXJuIFwiaXRlbXZhbHVlc1wiOyB9XG4gICAgICAgIHB1YmxpYyBoYXNFcnJvcigpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rb0l0ZW1zKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMua29JdGVtcygpW2ldO1xuICAgICAgICAgICAgICAgIGl0ZW0ua29IYXNFcnJvcighaXRlbS5rb1ZhbHVlKCkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBpdGVtLmtvSGFzRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZU5ld0VkaXRvckl0ZW0oKTogYW55IHsgcmV0dXJuIHsga29WYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBrb1RleHQ6IGtvLm9ic2VydmFibGUoKSwga29IYXNFcnJvcjoga28ub2JzZXJ2YWJsZShmYWxzZSkgfTsgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlRWRpdG9ySXRlbShpdGVtOiBhbnkpIHtcbiAgICAgICAgICAgIHZhciBpdGVtVmFsdWUgPSBpdGVtO1xuICAgICAgICAgICAgdmFyIGl0ZW1UZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChpdGVtLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaXRlbVZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgICBpdGVtVGV4dCA9IGl0ZW0udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IGtvVmFsdWU6IGtvLm9ic2VydmFibGUoaXRlbVZhbHVlKSwga29UZXh0OiBrby5vYnNlcnZhYmxlKGl0ZW1UZXh0KSwga29IYXNFcnJvcjoga28ub2JzZXJ2YWJsZShmYWxzZSkgfTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSXRlbUZyb21FZGl0b3JJdGVtKGVkaXRvckl0ZW06IGFueSkge1xuICAgICAgICAgICAgdmFyIGFsd2F5U2F2ZVRleHRJblByb3BlcnR5RWRpdG9ycyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYWx3YXlTYXZlVGV4dEluUHJvcGVydHlFZGl0b3JzO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBlZGl0b3JJdGVtLmtvVGV4dCgpO1xuICAgICAgICAgICAgaWYgKCFhbHdheVNhdmVUZXh0SW5Qcm9wZXJ0eUVkaXRvcnMgJiYgZWRpdG9ySXRlbS5rb1RleHQoKSA9PSBlZGl0b3JJdGVtLmtvVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGVkaXRvckl0ZW0ua29WYWx1ZSgpLCB0ZXh0OiB0ZXh0IH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UucmVnaXN0ZXJFZGl0b3IoXCJpdGVtdmFsdWVzXCIsIGZ1bmN0aW9uICgpOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UgeyByZXR1cm4gbmV3IFN1cnZleVByb3BlcnR5SXRlbVZhbHVlc0VkaXRvcigpOyB9KTtcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlFZGl0b3JCYXNlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwcm9wZXJ0eU1vZGFsRWRpdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwcm9wZXJ0eUl0ZW1zRWRpdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwcm9wZXJ0eUl0ZW1WYWx1ZXNFZGl0b3IudHNcIiAvPlxubW9kdWxlIFN1cnZleUVkaXRvciB7XG4gICAgZXhwb3J0IGNsYXNzIFN1cnZleVByb3BlcnR5RHJvcGRvd25Db2x1bW5zRWRpdG9yIGV4dGVuZHMgU3VydmV5UHJvcGVydHlJdGVtc0VkaXRvciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IGVkaXRvclR5cGUoKTogc3RyaW5nIHsgcmV0dXJuIFwibWF0cml4ZHJvcGRvd25jb2x1bW5zXCI7IH1cbiAgICAgICAgcHVibGljIGhhc0Vycm9yKCk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmtvSXRlbXMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB0aGlzLmtvSXRlbXMoKVtpXS5oYXNFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlTmV3RWRpdG9ySXRlbSgpOiBhbnkgeyByZXR1cm4gbmV3IFN1cnZleVByb3BlcnR5TWF0cml4RHJvcGRvd25Db2x1bW5zSXRlbShuZXcgU3VydmV5Lk1hdHJpeERyb3Bkb3duQ29sdW1uKFwiXCIsIHRoaXMub3B0aW9ucykpOyB9XG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVFZGl0b3JJdGVtKGl0ZW06IGFueSkgeyByZXR1cm4gbmV3IFN1cnZleVByb3BlcnR5TWF0cml4RHJvcGRvd25Db2x1bW5zSXRlbShpdGVtLCB0aGlzLm9wdGlvbnMpOyB9XG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJdGVtRnJvbUVkaXRvckl0ZW0oZWRpdG9ySXRlbTogYW55KSB7XG4gICAgICAgICAgICB2YXIgY29sdW1JdGVtID0gPFN1cnZleVByb3BlcnR5TWF0cml4RHJvcGRvd25Db2x1bW5zSXRlbT5lZGl0b3JJdGVtO1xuICAgICAgICAgICAgY29sdW1JdGVtLmFwcGx5KCk7XG4gICAgICAgICAgICByZXR1cm4gY29sdW1JdGVtLmNvbHVtbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlNYXRyaXhEcm9wZG93bkNvbHVtbnNJdGVtIHtcbiAgICAgICAgcHJpdmF0ZSBrb0Nob2ljZXM6IGFueTtcbiAgICAgICAgcHVibGljIGNob2ljZXNFZGl0b3I6IFN1cnZleVByb3BlcnR5SXRlbVZhbHVlc0VkaXRvcjtcbiAgICAgICAga29OYW1lOiBhbnk7IGtvVGl0bGU6IGFueTsga29DZWxsVHlwZTogYW55OyBrb1Nob3dDaG9pY2VzOiBhbnk7XG4gICAgICAgIGtvSGFzRXJyb3I6IGFueTsga29Db2xDb3VudDogYW55OyBrb0lzUmVxdWlyZWQ6IGFueTsga29IYXNPdGhlcjogYW55O1xuICAgICAgICBrb0hhc0Nob2ljZXM6IGFueTsga29IYXNDb2xDb3VudDogYW55O1xuICAgICAgICBwdWJsaWMgb25TaG93Q2hvaWNlc0NsaWNrOiBhbnk7XG4gICAgICAgIHB1YmxpYyBjZWxsVHlwZUNob2ljZXM6IEFycmF5PGFueT47XG4gICAgICAgIHB1YmxpYyBjb2xDb3VudENob2ljZXM6IEFycmF5PGFueT47XG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjb2x1bW46IFN1cnZleS5NYXRyaXhEcm9wZG93bkNvbHVtbiwgcHVibGljIG9wdGlvbnMgPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNlbGxUeXBlQ2hvaWNlcyA9IHRoaXMuZ2V0UHJvcGVydHlDaG9pY2VzKFwiY2VsbFR5cGVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbENvdW50Q2hvaWNlcyA9IHRoaXMuZ2V0UHJvcGVydHlDaG9pY2VzKFwiY29sQ291bnRcIik7XG4gICAgICAgICAgICB0aGlzLmtvTmFtZSA9IGtvLm9ic2VydmFibGUoY29sdW1uLm5hbWUpO1xuICAgICAgICAgICAgdGhpcy5rb0NlbGxUeXBlID0ga28ub2JzZXJ2YWJsZShjb2x1bW4uY2VsbFR5cGUpO1xuICAgICAgICAgICAgdGhpcy5rb0NvbENvdW50ID0ga28ub2JzZXJ2YWJsZShjb2x1bW4uY29sQ291bnQpO1xuICAgICAgICAgICAgdGhpcy5rb0lzUmVxdWlyZWQgPSBrby5vYnNlcnZhYmxlKGNvbHVtbi5pc1JlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMua29IYXNPdGhlciA9IGtvLm9ic2VydmFibGUoY29sdW1uLmhhc090aGVyID8gdHJ1ZSA6IGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMua29UaXRsZSA9IGtvLm9ic2VydmFibGUoY29sdW1uLm5hbWUgPT09IGNvbHVtbi50aXRsZSA/IFwiXCIgOiBjb2x1bW4udGl0bGUpO1xuICAgICAgICAgICAgdGhpcy5rb1Nob3dDaG9pY2VzID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmtvQ2hvaWNlcyA9IGtvLm9ic2VydmFibGVBcnJheShjb2x1bW4uY2hvaWNlcyk7XG4gICAgICAgICAgICB0aGlzLmtvSGFzRXJyb3IgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuICAgICAgICAgICAgdGhpcy5jaG9pY2VzRWRpdG9yID0gbmV3IFN1cnZleVByb3BlcnR5SXRlbVZhbHVlc0VkaXRvcigpO1xuICAgICAgICAgICAgdGhpcy5jaG9pY2VzRWRpdG9yLm9iamVjdCA9IHRoaXMuY29sdW1uO1xuICAgICAgICAgICAgdGhpcy5jaG9pY2VzRWRpdG9yLnZhbHVlID0gdGhpcy5rb0Nob2ljZXMoKTtcbiAgICAgICAgICAgIHRoaXMuY2hvaWNlc0VkaXRvci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLm9uU2hvd0Nob2ljZXNDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5rb1Nob3dDaG9pY2VzKCFzZWxmLmtvU2hvd0Nob2ljZXMoKSk7IH1cbiAgICAgICAgICAgIHRoaXMua29IYXNDaG9pY2VzID0ga28uY29tcHV0ZWQoZnVuY3Rpb24gKCkgeyByZXR1cm4gc2VsZi5rb0NlbGxUeXBlKCkgPT0gXCJkcm9wZG93blwiIHx8IHNlbGYua29DZWxsVHlwZSgpID09IFwiY2hlY2tib3hcIiB8fCBzZWxmLmtvQ2VsbFR5cGUoKSA9PSBcInJhZGlvZ3JvdXBcIjsgfSk7XG4gICAgICAgICAgICB0aGlzLmtvSGFzQ29sQ291bnQgPSBrby5jb21wdXRlZChmdW5jdGlvbiAoKSB7IHJldHVybiBzZWxmLmtvQ2VsbFR5cGUoKSA9PSBcImNoZWNrYm94XCIgfHwgc2VsZi5rb0NlbGxUeXBlKCkgPT0gXCJyYWRpb2dyb3VwXCI7IH0pO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBoYXNFcnJvcigpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHRoaXMua29IYXNFcnJvcighdGhpcy5rb05hbWUoKSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5rb0hhc0Vycm9yKCkgfHwgdGhpcy5jaG9pY2VzRWRpdG9yLmhhc0Vycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGFwcGx5KCkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW4ubmFtZSA9IHRoaXMua29OYW1lKCk7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbi50aXRsZSA9IHRoaXMua29UaXRsZSgpO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW4uY2VsbFR5cGUgPSB0aGlzLmtvQ2VsbFR5cGUoKTtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uLmNvbENvdW50ID0gdGhpcy5rb0NvbENvdW50KCk7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbi5pc1JlcXVpcmVkID0gdGhpcy5rb0lzUmVxdWlyZWQoKTtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uLmhhc090aGVyID0gdGhpcy5rb0hhc090aGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hvaWNlc0VkaXRvci5vbkFwcGx5Q2xpY2soKTtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uLmNob2ljZXMgPSB0aGlzLmNob2ljZXNFZGl0b3IudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRQcm9wZXJ0eUNob2ljZXMocHJvcGV0eU5hbWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBTdXJ2ZXkuSnNvbk9iamVjdC5tZXRhRGF0YS5nZXRQcm9wZXJ0aWVzKFwibWF0cml4ZHJvcGRvd25jb2x1bW5cIik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lID09IHByb3BldHlOYW1lKSByZXR1cm4gcHJvcGVydGllc1tpXS5jaG9pY2VzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlLnJlZ2lzdGVyRWRpdG9yKFwibWF0cml4ZHJvcGRvd25jb2x1bW5zXCIsIGZ1bmN0aW9uICgpOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UgeyByZXR1cm4gbmV3IFN1cnZleVByb3BlcnR5RHJvcGRvd25Db2x1bW5zRWRpdG9yKCk7IH0pO1xufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwcm9wZXJ0eUVkaXRvckJhc2UudHNcIiAvPlxuXG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlSZXN1bHRmdWxsRWRpdG9yIGV4dGVuZHMgU3VydmV5UHJvcGVydHlNb2RhbEVkaXRvciB7XG4gICAgICAgIGtvVXJsOiBhbnk7IGtvUGF0aDogYW55OyBrb1ZhbHVlTmFtZTogYW55OyBrb1RpdGxlTmFtZTogYW55O1xuICAgICAgICBwdWJsaWMgc3VydmV5OiBTdXJ2ZXkuU3VydmV5O1xuICAgICAgICBwdWJsaWMgcXVlc3Rpb246IFN1cnZleS5RdWVzdGlvbkRyb3Bkb3duO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMua29VcmwgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgICAgICB0aGlzLmtvUGF0aCA9IGtvLm9ic2VydmFibGUoKTtcbiAgICAgICAgICAgIHRoaXMua29WYWx1ZU5hbWUgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgICAgICB0aGlzLmtvVGl0bGVOYW1lID0ga28ub2JzZXJ2YWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVTdXJ2ZXkoKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMua29Vcmwuc3Vic2NyaWJlKGZ1bmN0aW9uIChuZXdWYWx1ZSkgeyBzZWxmLnF1ZXN0aW9uLmNob2ljZXNCeVVybC51cmwgPSBuZXdWYWx1ZTsgc2VsZi5ydW4oKTsgfSk7XG4gICAgICAgICAgICB0aGlzLmtvUGF0aC5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7IHNlbGYucXVlc3Rpb24uY2hvaWNlc0J5VXJsLnBhdGggPSBuZXdWYWx1ZTsgc2VsZi5ydW4oKTsgfSk7XG4gICAgICAgICAgICB0aGlzLmtvVmFsdWVOYW1lLnN1YnNjcmliZShmdW5jdGlvbiAobmV3VmFsdWUpIHsgc2VsZi5xdWVzdGlvbi5jaG9pY2VzQnlVcmwudmFsdWVOYW1lID0gbmV3VmFsdWU7IHNlbGYucnVuKCk7IH0pO1xuICAgICAgICAgICAgdGhpcy5rb1RpdGxlTmFtZS5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7IHNlbGYucXVlc3Rpb24uY2hvaWNlc0J5VXJsLnRpdGxlTmFtZSA9IG5ld1ZhbHVlOyBzZWxmLnJ1bigpOyB9KTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IGVkaXRvclR5cGUoKTogc3RyaW5nIHsgcmV0dXJuIFwicmVzdGZ1bGxcIjsgfVxuICAgICAgICBwdWJsaWMgZ2V0IHJlc3RmdWxsVmFsdWUoKSB7IHJldHVybiA8U3VydmV5LkNob2ljZXNSZXN0ZnVsbD50aGlzLnZhbHVlOyB9XG4gICAgICAgIHB1YmxpYyBnZXRWYWx1ZVRleHQodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICF2YWx1ZS51cmwpIHJldHVybiBlZGl0b3JMb2NhbGl6YXRpb24uZ2V0U3RyaW5nKFwicGUuZW1wdHlcIik7XG4gICAgICAgICAgICB2YXIgc3RyID0gdmFsdWUudXJsO1xuICAgICAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAyMCkge1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHIoMCwgMjApICsgXCIuLi5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIG9uVmFsdWVDaGFuZ2VkKCkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHRoaXMucmVzdGZ1bGxWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMua29VcmwodmFsID8gdmFsLnVybCA6IFwiXCIpO1xuICAgICAgICAgICAgdGhpcy5rb1BhdGgodmFsID8gdmFsLnBhdGggOiBcIlwiKTtcbiAgICAgICAgICAgIHRoaXMua29WYWx1ZU5hbWUodmFsID8gdmFsLnZhbHVlTmFtZSA6IFwiXCIpO1xuICAgICAgICAgICAgdGhpcy5rb1RpdGxlTmFtZSh2YWwgPyB2YWwudGl0bGVOYW1lIDogXCJcIik7XG4gICAgICAgICAgICB0aGlzLnN1cnZleS5yZW5kZXIoXCJyZXN0ZnVsbFN1cnZleVwiKTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgb25CZWZvcmVBcHBseSgpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBuZXcgU3VydmV5LkNob2ljZXNSZXN0ZnVsbCgpO1xuICAgICAgICAgICAgdmFsLnVybCA9IHRoaXMua29VcmwoKTtcbiAgICAgICAgICAgIHZhbC5wYXRoID0gdGhpcy5rb1BhdGgoKTtcbiAgICAgICAgICAgIHZhbC52YWx1ZU5hbWUgPSB0aGlzLmtvVmFsdWVOYW1lKCk7XG4gICAgICAgICAgICB2YWwudGl0bGVOYW1lID0gdGhpcy5rb1RpdGxlTmFtZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZUNvcmUodmFsKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHJ1bigpIHtcbiAgICAgICAgICAgIHRoaXMucXVlc3Rpb24uY2hvaWNlc0J5VXJsLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlU3VydmV5KCkge1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkgPSBuZXcgU3VydmV5LlN1cnZleSgpO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkuc2hvd05hdmlnYXRpb25CdXR0b25zID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN1cnZleS5zaG93UXVlc3Rpb25OdW1iZXJzID0gXCJvZmZcIjtcbiAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5zdXJ2ZXkuYWRkTmV3UGFnZShcInBhZ2UxXCIpO1xuICAgICAgICAgICAgdGhpcy5xdWVzdGlvbiA9IDxTdXJ2ZXkuUXVlc3Rpb25Ecm9wZG93bj5wYWdlLmFkZE5ld1F1ZXN0aW9uKFwiZHJvcGRvd25cIiwgXCJxMVwiKTtcbiAgICAgICAgICAgIHRoaXMucXVlc3Rpb24udGl0bGUgPSBlZGl0b3JMb2NhbGl6YXRpb24uZ2V0U3RyaW5nKFwicGUudGVzdFNlcnZpY2VcIilcbiAgICAgICAgICAgIHRoaXMucXVlc3Rpb24uY2hvaWNlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zdXJ2ZXkucmVuZGVyKFwicmVzdGZ1bGxTdXJ2ZXlcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UucmVnaXN0ZXJFZGl0b3IoXCJyZXN0ZnVsbFwiLCBmdW5jdGlvbiAoKTogU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlIHsgcmV0dXJuIG5ldyBTdXJ2ZXlQcm9wZXJ0eVJlc3VsdGZ1bGxFZGl0b3IoKTsgfSk7XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInByb3BlcnR5RWRpdG9yQmFzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlNb2RhbEVkaXRvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlJdGVtc0VkaXRvci50c1wiIC8+XG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlUZXh0SXRlbXNFZGl0b3IgZXh0ZW5kcyBTdXJ2ZXlQcm9wZXJ0eUl0ZW1zRWRpdG9yIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBnZXQgZWRpdG9yVHlwZSgpOiBzdHJpbmcgeyByZXR1cm4gXCJ0ZXh0aXRlbXNcIjsgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlTmV3RWRpdG9ySXRlbSgpOiBhbnkge1xuICAgICAgICAgICAgdmFyIG9ianMgPSBbXTtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMua29JdGVtcygpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG9ianMucHVzaCh7IG5hbWU6IGl0ZW1zW2ldLmtvTmFtZSgpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVkaXRJdGVtID0geyBrb05hbWU6IGtvLm9ic2VydmFibGUoU3VydmV5SGVscGVyLmdldE5ld05hbWUob2JqcywgXCJ0ZXh0XCIpKSwga29UaXRsZToga28ub2JzZXJ2YWJsZSgpIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZhbGlkYXRvcnNFZGl0b3IoZWRpdEl0ZW0sIFtdKTtcbiAgICAgICAgICAgIHJldHVybiBlZGl0SXRlbTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlRWRpdG9ySXRlbShpdGVtOiBhbnkpIHtcbiAgICAgICAgICAgIHZhciBlZGl0SXRlbSA9IHsga29OYW1lOiBrby5vYnNlcnZhYmxlKGl0ZW0ubmFtZSksIGtvVGl0bGU6IGtvLm9ic2VydmFibGUoaXRlbS50aXRsZSkgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmFsaWRhdG9yc0VkaXRvcihlZGl0SXRlbSwgaXRlbS52YWxpZGF0b3JzKTtcbiAgICAgICAgICAgIHJldHVybiBlZGl0SXRlbTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSXRlbUZyb21FZGl0b3JJdGVtKGVkaXRvckl0ZW06IGFueSkge1xuICAgICAgICAgICAgdmFyIGl0ZW1UZXh0ID0gbmV3IFN1cnZleS5NdWx0aXBsZVRleHRJdGVtKGVkaXRvckl0ZW0ua29OYW1lKCksIGVkaXRvckl0ZW0ua29UaXRsZSgpKTtcbiAgICAgICAgICAgIGl0ZW1UZXh0LnZhbGlkYXRvcnMgPSBlZGl0b3JJdGVtLnZhbGlkYXRvcnM7XG4gICAgICAgICAgICByZXR1cm4gaXRlbVRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVWYWxpZGF0b3JzRWRpdG9yKGl0ZW06IGFueSwgdmFsaWRhdG9yczogQXJyYXk8YW55Pikge1xuICAgICAgICAgICAgaXRlbS52YWxpZGF0b3JzID0gdmFsaWRhdG9ycy5zbGljZSgpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG9uSXRlbUNoYW5nZWQgPSBmdW5jdGlvbiAobmV3VmFsdWU6IGFueSkgeyBpdGVtLnZhbGlkYXRvcnMgPSBuZXdWYWx1ZTsgaXRlbS5rb1RleHQoc2VsZi5nZXRUZXh0KG5ld1ZhbHVlLmxlbmd0aCkpOyB9O1xuICAgICAgICAgICAgdmFyIHByb3BlcnR5RWRpdG9yID0gbmV3IFN1cnZleVByb3BlcnR5VmFsaWRhdG9yc0VkaXRvcigpO1xuICAgICAgICAgICAgaXRlbS5lZGl0b3IgPSBwcm9wZXJ0eUVkaXRvcjtcbiAgICAgICAgICAgIHByb3BlcnR5RWRpdG9yLm9uQ2hhbmdlZCA9IChuZXdWYWx1ZTogYW55KSA9PiB7IG9uSXRlbUNoYW5nZWQobmV3VmFsdWUpOyB9O1xuICAgICAgICAgICAgcHJvcGVydHlFZGl0b3Iub2JqZWN0ID0gaXRlbTtcbiAgICAgICAgICAgIHByb3BlcnR5RWRpdG9yLnRpdGxlKGVkaXRvckxvY2FsaXphdGlvbi5nZXRTdHJpbmcoXCJwZS5lZGl0UHJvcGVydHlcIilbXCJmb3JtYXRcIl0oXCJWYWxpZGF0b3JzXCIpKTtcbiAgICAgICAgICAgIHByb3BlcnR5RWRpdG9yLnZhbHVlID0gaXRlbS52YWxpZGF0b3JzO1xuICAgICAgICAgICAgaXRlbS5rb1RleHQgPSBrby5vYnNlcnZhYmxlKHRoaXMuZ2V0VGV4dCh2YWxpZGF0b3JzLmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0VGV4dChsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhcInBlLml0ZW1zXCIpW1wiZm9ybWF0XCJdKGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UucmVnaXN0ZXJFZGl0b3IoXCJ0ZXh0aXRlbXNcIiwgZnVuY3Rpb24gKCk6IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZSB7IHJldHVybiBuZXcgU3VydmV5UHJvcGVydHlUZXh0SXRlbXNFZGl0b3IoKTsgfSk7XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInByb3BlcnR5RWRpdG9yQmFzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlNb2RhbEVkaXRvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlJdGVtc0VkaXRvci50c1wiIC8+XG5tb2R1bGUgU3VydmV5RWRpdG9yIHtcbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlUcmlnZ2Vyc0VkaXRvciBleHRlbmRzIFN1cnZleVByb3BlcnR5SXRlbXNFZGl0b3Ige1xuICAgICAgICBrb1F1ZXN0aW9uczogYW55OyBrb1BhZ2VzOiBhbnk7XG4gICAgICAgIHB1YmxpYyBrb1NlbGVjdGVkOiBhbnk7XG4gICAgICAgIHB1YmxpYyBhdmFpbGFibGVUcmlnZ2VyczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgICAgICBwcml2YXRlIHRyaWdnZXJDbGFzc2VzOiBBcnJheTxTdXJ2ZXkuSnNvbk1ldGFkYXRhQ2xhc3M+ID0gW107XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMub25EZWxldGVDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5rb0l0ZW1zLnJlbW92ZShzZWxmLmtvU2VsZWN0ZWQoKSk7IH1cbiAgICAgICAgICAgIHRoaXMub25BZGRDbGljayA9IGZ1bmN0aW9uICh0cmlnZ2VyVHlwZSkgeyBzZWxmLmFkZEl0ZW0odHJpZ2dlclR5cGUpOyB9XG4gICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWQgPSBrby5vYnNlcnZhYmxlKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5rb1BhZ2VzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLmtvUXVlc3Rpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJDbGFzc2VzID0gU3VydmV5Lkpzb25PYmplY3QubWV0YURhdGEuZ2V0Q2hpbGRyZW5DbGFzc2VzKFwic3VydmV5dHJpZ2dlclwiLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuYXZhaWxhYmxlVHJpZ2dlcnMgPSB0aGlzLmdldEF2YWlsYWJsZVRyaWdnZXJzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldCBlZGl0b3JUeXBlKCk6IHN0cmluZyB7IHJldHVybiBcInRyaWdnZXJzXCI7IH1cbiAgICAgICAgcHJvdGVjdGVkIG9uVmFsdWVDaGFuZ2VkKCkge1xuICAgICAgICAgICAgc3VwZXIub25WYWx1ZUNoYW5nZWQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9iamVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMua29QYWdlcyh0aGlzLmdldE5hbWVzKCg8U3VydmV5LlN1cnZleT50aGlzLm9iamVjdCkucGFnZXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmtvUXVlc3Rpb25zKHRoaXMuZ2V0TmFtZXMoKDxTdXJ2ZXkuU3VydmV5PnRoaXMub2JqZWN0KS5nZXRBbGxRdWVzdGlvbnMoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMua29TZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMua29TZWxlY3RlZCh0aGlzLmtvSXRlbXMoKS5sZW5ndGggPiAwID8gdGhpcy5rb0l0ZW1zKClbMF0gOiBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgYWRkSXRlbSh0cmlnZ2VyVHlwZTogc3RyaW5nKSB7XG4gICAgICAgICAgICB2YXIgdHJpZ2dlciA9IFN1cnZleS5Kc29uT2JqZWN0Lm1ldGFEYXRhLmNyZWF0ZUNsYXNzKHRyaWdnZXJUeXBlKTtcbiAgICAgICAgICAgIHZhciB0cmlnZ2VySXRlbSA9IHRoaXMuY3JlYXRlUHJvcGVydHlUcmlnZ2VyKHRyaWdnZXIpO1xuICAgICAgICAgICAgdGhpcy5rb0l0ZW1zLnB1c2godHJpZ2dlckl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkKHRyaWdnZXJJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlRWRpdG9ySXRlbShpdGVtOiBhbnkpIHtcbiAgICAgICAgICAgIHZhciBqc29uT2JqID0gbmV3IFN1cnZleS5Kc29uT2JqZWN0KCk7XG4gICAgICAgICAgICB2YXIgdHJpZ2dlciA9IFN1cnZleS5Kc29uT2JqZWN0Lm1ldGFEYXRhLmNyZWF0ZUNsYXNzKGl0ZW0uZ2V0VHlwZSgpKTtcbiAgICAgICAgICAgIGpzb25PYmoudG9PYmplY3QoaXRlbSwgdHJpZ2dlcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVQcm9wZXJ0eVRyaWdnZXIoPFN1cnZleS5TdXJ2ZXlUcmlnZ2VyPnRyaWdnZXIpO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJdGVtRnJvbUVkaXRvckl0ZW0oZWRpdG9ySXRlbTogYW55KSB7XG4gICAgICAgICAgICB2YXIgZWRpdG9yVHJpZ2dlciA9IDxTdXJ2ZXlQcm9wZXJ0eVRyaWdnZXI+ZWRpdG9ySXRlbTtcbiAgICAgICAgICAgIHJldHVybiBlZGl0b3JUcmlnZ2VyLmNyZWF0ZVRyaWdnZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldEF2YWlsYWJsZVRyaWdnZXJzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyaWdnZXJDbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy50cmlnZ2VyQ2xhc3Nlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXROYW1lcyhpdGVtczogQXJyYXk8YW55Pik6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICAgICAgdmFyIG5hbWVzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVtcIm5hbWVcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChpdGVtW1wibmFtZVwiXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5hbWVzO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlUHJvcGVydHlUcmlnZ2VyKHRyaWdnZXI6IFN1cnZleS5TdXJ2ZXlUcmlnZ2VyKTogU3VydmV5UHJvcGVydHlUcmlnZ2VyIHtcbiAgICAgICAgICAgIHZhciB0cmlnZ2VySXRlbSA9IG51bGw7XG4gICAgICAgICAgICBpZiAodHJpZ2dlci5nZXRUeXBlKCkgPT0gXCJ2aXNpYmxldHJpZ2dlclwiKSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckl0ZW0gPSBuZXcgU3VydmV5UHJvcGVydHlWaXNpYmxlVHJpZ2dlcig8U3VydmV5LlN1cnZleVRyaWdnZXJWaXNpYmxlPnRyaWdnZXIsIHRoaXMua29QYWdlcywgdGhpcy5rb1F1ZXN0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHJpZ2dlci5nZXRUeXBlKCkgPT0gXCJzZXR2YWx1ZXRyaWdnZXJcIikge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJJdGVtID0gbmV3IFN1cnZleVByb3BlcnR5U2V0VmFsdWVUcmlnZ2VyKDxTdXJ2ZXkuU3VydmV5VHJpZ2dlclNldFZhbHVlPnRyaWdnZXIsIHRoaXMua29RdWVzdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0cmlnZ2VySXRlbSkge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJJdGVtID0gbmV3IFN1cnZleVByb3BlcnR5VHJpZ2dlcih0cmlnZ2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cmlnZ2VySXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU3VydmV5UHJvcGVydHlUcmlnZ2VyIHtcbiAgICAgICAgcHJpdmF0ZSBvcGVyYXRvcnMgPSBbXCJlbXB0eVwiLCBcIm5vdGVtcHR5XCIsIFwiZXF1YWxcIiwgXCJub3RlcXVhbFwiLCBcImNvbnRhaW5zXCIsIFwibm90Y29udGFpbnNcIiwgXCJncmVhdGVyXCIsIFwibGVzc1wiLCBcImdyZWF0ZXJvcmVxdWFsXCIsIFwibGVzc29yZXF1YWxcIl07XG4gICAgICAgIHByaXZhdGUgdHJpZ2dlclR5cGU6IHN0cmluZztcbiAgICAgICAgYXZhaWxhYmxlT3BlcmF0b3JzID0gW107XG4gICAgICAgIGtvTmFtZTogYW55OyBrb09wZXJhdG9yOiBhbnk7IGtvVmFsdWU6IGFueTsga29UeXBlOiBhbnk7XG4gICAgICAgIGtvVGV4dDogYW55OyBrb0lzVmFsaWQ6IGFueTsga29SZXF1aXJlVmFsdWU6IGFueTtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdHJpZ2dlcjogU3VydmV5LlN1cnZleVRyaWdnZXIpIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlT3BlcmF0b3JzKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJUeXBlID0gdHJpZ2dlci5nZXRUeXBlKCk7XG4gICAgICAgICAgICB0aGlzLmtvVHlwZSA9IGtvLm9ic2VydmFibGUodGhpcy50cmlnZ2VyVHlwZSk7XG4gICAgICAgICAgICB0aGlzLmtvTmFtZSA9IGtvLm9ic2VydmFibGUodHJpZ2dlci5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMua29PcGVyYXRvciA9IGtvLm9ic2VydmFibGUodHJpZ2dlci5vcGVyYXRvcik7XG4gICAgICAgICAgICB0aGlzLmtvVmFsdWUgPSBrby5vYnNlcnZhYmxlKHRyaWdnZXIudmFsdWUpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5rb1JlcXVpcmVWYWx1ZSA9IGtvLmNvbXB1dGVkKCgpID0+IHsgcmV0dXJuIHNlbGYua29PcGVyYXRvcigpICE9IFwiZW1wdHlcIiAmJiBzZWxmLmtvT3BlcmF0b3IoKSAhPSBcIm5vdGVtcHR5XCI7IH0pO1xuICAgICAgICAgICAgdGhpcy5rb0lzVmFsaWQgPSBrby5jb21wdXRlZCgoKSA9PiB7IGlmIChzZWxmLmtvTmFtZSgpICYmICghc2VsZi5rb1JlcXVpcmVWYWx1ZSgpIHx8IHNlbGYua29WYWx1ZSgpKSkgcmV0dXJuIHRydWU7IHJldHVybiBmYWxzZTsgfSk7XG4gICAgICAgICAgICB0aGlzLmtvVGV4dCA9IGtvLmNvbXB1dGVkKCgpID0+IHsgc2VsZi5rb05hbWUoKTsgc2VsZi5rb09wZXJhdG9yKCk7IHNlbGYua29WYWx1ZSgpOyByZXR1cm4gc2VsZi5nZXRUZXh0KCk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBjcmVhdGVUcmlnZ2VyKCk6IFN1cnZleS5TdXJ2ZXlUcmlnZ2VyIHtcbiAgICAgICAgICAgIHZhciB0cmlnZ2VyID0gPFN1cnZleS5TdXJ2ZXlUcmlnZ2VyPlN1cnZleS5Kc29uT2JqZWN0Lm1ldGFEYXRhLmNyZWF0ZUNsYXNzKHRoaXMudHJpZ2dlclR5cGUpO1xuICAgICAgICAgICAgdHJpZ2dlci5uYW1lID0gdGhpcy5rb05hbWUoKTtcbiAgICAgICAgICAgIHRyaWdnZXIub3BlcmF0b3IgPSB0aGlzLmtvT3BlcmF0b3IoKTtcbiAgICAgICAgICAgIHRyaWdnZXIudmFsdWUgPSB0aGlzLmtvVmFsdWUoKTtcbiAgICAgICAgICAgIHJldHVybiB0cmlnZ2VyO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY3JlYXRlT3BlcmF0b3JzKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wZXJhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5vcGVyYXRvcnNbaV07XG4gICAgICAgICAgICAgICAgdGhpcy5hdmFpbGFibGVPcGVyYXRvcnMucHVzaCh7IG5hbWU6IG5hbWUsIHRleHQ6IGVkaXRvckxvY2FsaXphdGlvbi5nZXRTdHJpbmcoXCJvcC5cIiArIG5hbWUpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmtvSXNWYWxpZCgpKSByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhcInBlLnRyaWdnZXJOb3RTZXRcIik7XG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhcInBlLnRyaWdnZXJSdW5JZlwiKSArIFwiICdcIiArIHRoaXMua29OYW1lKCkgKyBcIicgXCIgKyB0aGlzLmdldE9wZXJhdG9yVGV4dCgpICsgdGhpcy5nZXRWYWx1ZVRleHQoKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGdldE9wZXJhdG9yVGV4dCgpOiBzdHJpbmcge1xuICAgICAgICAgICAgdmFyIG9wID0gdGhpcy5rb09wZXJhdG9yKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXZhaWxhYmxlT3BlcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXZhaWxhYmxlT3BlcmF0b3JzW2ldLm5hbWUgPT0gb3ApIHJldHVybiB0aGlzLmF2YWlsYWJsZU9wZXJhdG9yc1tpXS50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgZ2V0VmFsdWVUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgICAgICBpZiAoIXRoaXMua29SZXF1aXJlVmFsdWUoKSkgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICByZXR1cm4gXCIgXCIgKyB0aGlzLmtvVmFsdWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlQcm9wZXJ0eVZpc2libGVUcmlnZ2VyIGV4dGVuZHMgU3VydmV5UHJvcGVydHlUcmlnZ2VyIHtcbiAgICAgICAgcHVibGljIHBhZ2VzOiBTdXJ2ZXlQcm9wZXJ0eVRyaWdnZXJPYmplY3RzO1xuICAgICAgICBwdWJsaWMgcXVlc3Rpb25zOiBTdXJ2ZXlQcm9wZXJ0eVRyaWdnZXJPYmplY3RzO1xuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdHJpZ2dlcjogU3VydmV5LlN1cnZleVRyaWdnZXJWaXNpYmxlLCBrb1BhZ2VzOiBhbnksIGtvUXVlc3Rpb25zOiBhbnkpIHtcbiAgICAgICAgICAgIHN1cGVyKHRyaWdnZXIpO1xuICAgICAgICAgICAgdGhpcy5wYWdlcyA9IG5ldyBTdXJ2ZXlQcm9wZXJ0eVRyaWdnZXJPYmplY3RzKGVkaXRvckxvY2FsaXphdGlvbi5nZXRTdHJpbmcoXCJwZS50cmlnZ2VyTWFrZVBhZ2VzVmlzaWJsZVwiKSwga29QYWdlcygpLCB0cmlnZ2VyLnBhZ2VzKTtcbiAgICAgICAgICAgIHRoaXMucXVlc3Rpb25zID0gbmV3IFN1cnZleVByb3BlcnR5VHJpZ2dlck9iamVjdHMoZWRpdG9yTG9jYWxpemF0aW9uLmdldFN0cmluZyhcInBlLnRyaWdnZXJNYWtlUXVlc3Rpb25zVmlzaWJsZVwiKSwga29RdWVzdGlvbnMoKSwgdHJpZ2dlci5xdWVzdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBjcmVhdGVUcmlnZ2VyKCk6IFN1cnZleS5TdXJ2ZXlUcmlnZ2VyIHtcbiAgICAgICAgICAgIHZhciB0cmlnZ2VyID0gPFN1cnZleS5TdXJ2ZXlUcmlnZ2VyVmlzaWJsZT5zdXBlci5jcmVhdGVUcmlnZ2VyKCk7XG4gICAgICAgICAgICB0cmlnZ2VyLnBhZ2VzID0gdGhpcy5wYWdlcy5rb0Nob29zZW4oKTtcbiAgICAgICAgICAgIHRyaWdnZXIucXVlc3Rpb25zID0gdGhpcy5xdWVzdGlvbnMua29DaG9vc2VuKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJpZ2dlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlQcm9wZXJ0eVNldFZhbHVlVHJpZ2dlciBleHRlbmRzIFN1cnZleVByb3BlcnR5VHJpZ2dlciB7XG4gICAgICAgIGtvUXVlc3Rpb25zOiBhbnk7IGtvc2V0VG9OYW1lOiBhbnk7IGtvc2V0VmFsdWU6IGFueTsga29pc1ZhcmlhYmxlOiBhbnk7XG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB0cmlnZ2VyOiBTdXJ2ZXkuU3VydmV5VHJpZ2dlclNldFZhbHVlLCBrb1F1ZXN0aW9uczogYW55KSB7XG4gICAgICAgICAgICBzdXBlcih0cmlnZ2VyKTtcbiAgICAgICAgICAgIHRoaXMua29RdWVzdGlvbnMgPSBrb1F1ZXN0aW9ucztcbiAgICAgICAgICAgIHRoaXMua29zZXRUb05hbWUgPSBrby5vYnNlcnZhYmxlKHRyaWdnZXIuc2V0VG9OYW1lKTtcbiAgICAgICAgICAgIHRoaXMua29zZXRWYWx1ZSA9IGtvLm9ic2VydmFibGUodHJpZ2dlci5zZXRWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLmtvaXNWYXJpYWJsZSA9IGtvLm9ic2VydmFibGUodHJpZ2dlci5pc1ZhcmlhYmxlKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgY3JlYXRlVHJpZ2dlcigpOiBTdXJ2ZXkuU3VydmV5VHJpZ2dlciB7XG4gICAgICAgICAgICB2YXIgdHJpZ2dlciA9IDxTdXJ2ZXkuU3VydmV5VHJpZ2dlclNldFZhbHVlPnN1cGVyLmNyZWF0ZVRyaWdnZXIoKTtcbiAgICAgICAgICAgIHRyaWdnZXIuc2V0VG9OYW1lID0gdGhpcy5rb3NldFRvTmFtZSgpO1xuICAgICAgICAgICAgdHJpZ2dlci5zZXRWYWx1ZSA9IHRoaXMua29zZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdHJpZ2dlci5pc1ZhcmlhYmxlID0gdGhpcy5rb2lzVmFyaWFibGUoKTtcbiAgICAgICAgICAgIHJldHVybiB0cmlnZ2VyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlQcm9wZXJ0eVRyaWdnZXJPYmplY3RzIHtcbiAgICAgICAga29PYmplY3RzOiBhbnk7XG4gICAgICAgIGtvQ2hvb3NlbjogYW55O1xuICAgICAgICBrb1NlbGVjdGVkOiBhbnk7XG4gICAgICAgIGtvQ2hvb3NlblNlbGVjdGVkOiBhbnk7XG4gICAgICAgIHB1YmxpYyBvbkRlbGV0ZUNsaWNrOiBhbnk7XG4gICAgICAgIHB1YmxpYyBvbkFkZENsaWNrOiBhbnk7XG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB0aXRsZTogc3RyaW5nLCBhbGxPYmplY3RzOiBBcnJheTxzdHJpbmc+LCBjaG9vc2VuT2JqZWN0czogQXJyYXk8c3RyaW5nPikge1xuICAgICAgICAgICAgdGhpcy5rb0Nob29zZW4gPSBrby5vYnNlcnZhYmxlQXJyYXkoY2hvb3Nlbk9iamVjdHMpO1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGFsbE9iamVjdHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNob29zZW5PYmplY3RzLmluZGV4T2YoaXRlbSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5rb09iamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoYXJyYXkpO1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkID0ga28ub2JzZXJ2YWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5rb0Nob29zZW5TZWxlY3RlZCA9IGtvLm9ic2VydmFibGUoKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMub25EZWxldGVDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5kZWxldGVJdGVtKCk7IH1cbiAgICAgICAgICAgIHRoaXMub25BZGRDbGljayA9IGZ1bmN0aW9uICgpIHsgc2VsZi5hZGRJdGVtKCk7IH1cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGRlbGV0ZUl0ZW0oKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUl0ZW1zKHRoaXMua29DaG9vc2VuU2VsZWN0ZWQoKSwgdGhpcy5rb0Nob29zZW4sIHRoaXMua29PYmplY3RzKTtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGFkZEl0ZW0oKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUl0ZW1zKHRoaXMua29TZWxlY3RlZCgpLCB0aGlzLmtvT2JqZWN0cywgdGhpcy5rb0Nob29zZW4pO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgY2hhbmdlSXRlbXMoaXRlbTogc3RyaW5nLCByZW1vdmVkRnJvbTogYW55LCBhZGRUbzogYW55KSB7XG4gICAgICAgICAgICByZW1vdmVkRnJvbS5yZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICBhZGRUby5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgcmVtb3ZlZEZyb20uc29ydCgpO1xuICAgICAgICAgICAgYWRkVG8uc29ydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgU3VydmV5UHJvcGVydHlFZGl0b3JCYXNlLnJlZ2lzdGVyRWRpdG9yKFwidHJpZ2dlcnNcIiwgZnVuY3Rpb24gKCk6IFN1cnZleVByb3BlcnR5RWRpdG9yQmFzZSB7IHJldHVybiBuZXcgU3VydmV5UHJvcGVydHlUcmlnZ2Vyc0VkaXRvcigpOyB9KTtcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicHJvcGVydHlFZGl0b3JCYXNlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwcm9wZXJ0eU1vZGFsRWRpdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwcm9wZXJ0eUl0ZW1zRWRpdG9yLnRzXCIgLz5cbm1vZHVsZSBTdXJ2ZXlFZGl0b3Ige1xuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlQcm9wZXJ0eVZhbGlkYXRvcnNFZGl0b3IgZXh0ZW5kcyBTdXJ2ZXlQcm9wZXJ0eUl0ZW1zRWRpdG9yIHtcbiAgICAgICAgcHJpdmF0ZSBzZWxlY3RlZE9iamVjdEVkaXRvcjogU3VydmV5T2JqZWN0RWRpdG9yO1xuICAgICAgICBwdWJsaWMga29TZWxlY3RlZDogYW55O1xuICAgICAgICBwdWJsaWMgYXZhaWxhYmxlVmFsaWRhdG9yczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgICAgICBwcml2YXRlIHZhbGlkYXRvckNsYXNzZXM6IEFycmF5PFN1cnZleS5Kc29uTWV0YWRhdGFDbGFzcz4gPSBbXTtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE9iamVjdEVkaXRvciA9IG5ldyBTdXJ2ZXlPYmplY3RFZGl0b3IoKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRPYmplY3RFZGl0b3Iub25Qcm9wZXJ0eVZhbHVlQ2hhbmdlZC5hZGQoKHNlbmRlciwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYub25Qcm9wZXJ0eVZhbHVlQ2hhbmdlZChvcHRpb25zLnByb3BlcnR5LCBvcHRpb25zLm9iamVjdCwgb3B0aW9ucy5uZXdWYWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMua29TZWxlY3RlZCA9IGtvLm9ic2VydmFibGUobnVsbCk7XG4gICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWQuc3Vic2NyaWJlKGZ1bmN0aW9uIChuZXdWYWx1ZSkgeyBzZWxmLnNlbGVjdGVkT2JqZWN0RWRpdG9yLnNlbGVjdGVkT2JqZWN0ID0gbmV3VmFsdWUgIT0gbnVsbCA/IG5ld1ZhbHVlLnZhbGlkYXRvciA6IG51bGw7IH0pO1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0b3JDbGFzc2VzID0gU3VydmV5Lkpzb25PYmplY3QubWV0YURhdGEuZ2V0Q2hpbGRyZW5DbGFzc2VzKFwic3VydmV5dmFsaWRhdG9yXCIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hdmFpbGFibGVWYWxpZGF0b3JzID0gdGhpcy5nZXRBdmFpbGFibGVWYWxpZGF0b3JzKCk7XG4gICAgICAgICAgICB0aGlzLm9uRGVsZXRlQ2xpY2sgPSBmdW5jdGlvbiAoKSB7IHNlbGYua29JdGVtcy5yZW1vdmUoc2VsZi5rb1NlbGVjdGVkKCkpOyB9XG4gICAgICAgICAgICB0aGlzLm9uQWRkQ2xpY2sgPSBmdW5jdGlvbiAodmFsaWRhdG9yVHlwZSkgeyBzZWxmLmFkZEl0ZW0odmFsaWRhdG9yVHlwZSk7IH1cbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgZ2V0IGVkaXRvclR5cGUoKTogc3RyaW5nIHsgcmV0dXJuIFwidmFsaWRhdG9yc1wiOyB9XG4gICAgICAgIHByb3RlY3RlZCBvblZhbHVlQ2hhbmdlZCgpIHtcbiAgICAgICAgICAgIHN1cGVyLm9uVmFsdWVDaGFuZ2VkKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5rb1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkKHRoaXMua29JdGVtcygpLmxlbmd0aCA+IDAgPyB0aGlzLmtvSXRlbXMoKVswXSA6IG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVFZGl0b3JJdGVtKGl0ZW06IGFueSkge1xuICAgICAgICAgICAgdmFyIGpzb25PYmogPSBuZXcgU3VydmV5Lkpzb25PYmplY3QoKTtcbiAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSBTdXJ2ZXkuSnNvbk9iamVjdC5tZXRhRGF0YS5jcmVhdGVDbGFzcyhpdGVtLmdldFR5cGUoKSk7XG4gICAgICAgICAgICBqc29uT2JqLnRvT2JqZWN0KGl0ZW0sIHZhbGlkYXRvcik7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN1cnZleVByb3BlcnR5VmFsaWRhdG9ySXRlbSh2YWxpZGF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJdGVtRnJvbUVkaXRvckl0ZW0oZWRpdG9ySXRlbTogYW55KSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IDxTdXJ2ZXlQcm9wZXJ0eVZhbGlkYXRvckl0ZW0+ZWRpdG9ySXRlbTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbGlkYXRvcjtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIGFkZEl0ZW0odmFsaWRhdG9yVHlwZTogc3RyaW5nKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsaWRhdG9yID0gbmV3IFN1cnZleVByb3BlcnR5VmFsaWRhdG9ySXRlbShTdXJ2ZXkuSnNvbk9iamVjdC5tZXRhRGF0YS5jcmVhdGVDbGFzcyh2YWxpZGF0b3JUeXBlKSk7XG4gICAgICAgICAgICB0aGlzLmtvSXRlbXMucHVzaChuZXdWYWxpZGF0b3IpO1xuICAgICAgICAgICAgdGhpcy5rb1NlbGVjdGVkKG5ld1ZhbGlkYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBnZXRBdmFpbGFibGVWYWxpZGF0b3JzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZhbGlkYXRvckNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnZhbGlkYXRvckNsYXNzZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgb25Qcm9wZXJ0eVZhbHVlQ2hhbmdlZChwcm9wZXJ0eTogU3VydmV5Lkpzb25PYmplY3RQcm9wZXJ0eSwgb2JqOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmtvU2VsZWN0ZWQoKSA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmtvU2VsZWN0ZWQoKS52YWxpZGF0b3JbcHJvcGVydHkubmFtZV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBTdXJ2ZXlQcm9wZXJ0eVZhbGlkYXRvckl0ZW0ge1xuICAgICAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsaWRhdG9yOiBTdXJ2ZXkuU3VydmV5VmFsaWRhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLnRleHQgPSB2YWxpZGF0b3IuZ2V0VHlwZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UucmVnaXN0ZXJFZGl0b3IoXCJ2YWxpZGF0b3JzXCIsIGZ1bmN0aW9uICgpOiBTdXJ2ZXlQcm9wZXJ0eUVkaXRvckJhc2UgeyByZXR1cm4gbmV3IFN1cnZleVByb3BlcnR5VmFsaWRhdG9yc0VkaXRvcigpOyB9KTtcbn0iXSwic291cmNlUm9vdCI6InNyYyJ9
