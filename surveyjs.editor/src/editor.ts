﻿/// <reference path="objectEditor.ts" />
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

module SurveyEditor {
    export class SurveyEditor {
        public static updateTextTimeout: number = 1000;
        public static defaultNewSurveyText: string = "{ pages: [ { name: 'page1'}] }";
        private renderedElement: HTMLElement;
        private surveyjs: HTMLElement;
        private surveyjsExample: HTMLElement;

        private jsonEditor: AceAjax.Editor;
        private isProcessingImmediately: boolean;
        private selectedObjectEditor: SurveyObjectEditor;
        private pagesEditor: SurveyPagesEditor;
        private surveyEmbeding: SurveyEmbedingWindow
        private surveyObjects: SurveyObjects;
        private surveyVerbs: SurveyVerbs;
        private textWorker: SurveyTextWorker;
        private undoRedo: SurveyUndoRedo;
        private surveyValue: Survey.Survey;
        private saveSurveyFuncValue: (no: number, onSaveCallback: (no: number, isSuccess: boolean) => void) => void;
        private options: any;
        private stateValue: string = "";
        private availableSurveiesOptionsList: any;

        public surveyId: string = null;
        public surveyPostId: string = null;
        public questionTypes: string[];
        public koCopiedQuestions: any;
        public generateValidJSONChangedCallback: (generateValidJSON: boolean) => void;
        public alwaySaveTextInPropertyEditors: boolean = false;
        
        koIsShowDesigner: any;
        koViewType: any;
        koCanDeleteObject: any;
        koObjects: any; koSelectedObject: any;
        koShowSaveButton: any;
        koGenerateValidJSON: any; koShowOptions: any; koTestSurveyWidth: any;
        selectDesignerClick: any; addNewSurveyClick: any; removeSurveyClick: any; selectAction: any;selectEditorClick: any; selectTestClick: any; selectEmbedClick: any; availableSurveySelect: any; saveSurveyClick: any;
        generateValidJSONClick: any; generateReadableJSONClick: any;
        doUndoClick: any; doRedoClick: any;
        deleteObjectClick: any;
        koState: any;
        runSurveyClick: any; embedingSurveyClick: any;
        saveButtonClick: any;
        draggingQuestion: any; clickQuestion: any;
        draggingCopiedQuestion: any; clickCopiedQuestion: any;

        constructor(renderedElement: any = null, options: any = null) {
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
                if (!self.options) self.options = {};
                self.options.generateValidJSON = newValue;
                if (self.generateValidJSONChangedCallback) self.generateValidJSONChangedCallback(newValue);
            });
            this.surveyObjects = new SurveyObjects(this.koObjects, this.koSelectedObject);
            this.undoRedo = new SurveyUndoRedo();
            this.surveyVerbs = new SurveyVerbs(function () { self.setModified(); });

            this.selectedObjectEditor = new SurveyObjectEditor(this.options);
            this.selectedObjectEditor.onPropertyValueChanged.add((sender, options) => {
                self.onPropertyValueChanged(options.property, options.object, options.newValue);
            });
            this.pagesEditor = new SurveyPagesEditor(() => { self.addPage(); }, (page: Survey.Page) => { self.surveyObjects.selectObject(page); },
                (indexFrom: number, indexTo: number) => { self.movePage(indexFrom, indexTo); }, (page: Survey.Page) => { self.deleteCurrentObject(); });
            this.surveyEmbeding = new SurveyEmbedingWindow();

            this.koViewType = ko.observable("action");
            this.koIsShowDesigner = ko.computed(function () { return self.koViewType() == "designer"; });
            this.selectAction = function () { self.showActions(); };
            this.selectDesignerClick = function () { self.showDesigner(); };
            this.addNewSurveyClick = function () {self.addNewSurvey(); }
            this.removeSurveyClick = function() {self.removeSurvey()}
            this.saveSurveyClick = function () { self.saveSurvey(); };
            this.selectEditorClick = function () { self.showJsonEditor(); };
            this.selectTestClick = function () { self.showTestSurvey(); };
            this.selectEmbedClick = function () { self.showEmbedEditor(); };
            this.generateValidJSONClick = function () { self.koGenerateValidJSON(true); }
            this.generateReadableJSONClick = function () { self.koGenerateValidJSON(false); }
            this.runSurveyClick = function () { self.showLiveSurvey(); };
            this.embedingSurveyClick = function () { self.showSurveyEmbeding(); };
            this.deleteObjectClick = function () { self.deleteCurrentObject(); };
            this.draggingQuestion = function (questionType, e) { self.doDraggingQuestion(questionType, e); }
            this.clickQuestion = function (questionType) { self.doClickQuestion(questionType); }
            this.draggingCopiedQuestion = function (item, e) { self.doDraggingCopiedQuestion(item.json, e); }
            this.clickCopiedQuestion = function (item) { self.doClickCopiedQuestion(item.json); }

            this.doUndoClick = function () { self.doUndoRedo(self.undoRedo.undo()); };
            this.doRedoClick = function () { self.doUndoRedo(self.undoRedo.redo()); };

            if (renderedElement) {
                this.render(renderedElement);
            }
        }
        public get survey(): Survey.Survey {
            return this.surveyValue;
        }
        public render(element: any = null) {
            var self = this;
            if (element && typeof element == "string") {
                element = document.getElementById(element);
            }
            if (element) {
                this.renderedElement = element;
            }
            element = this.renderedElement;
            if (!element) return;
            element.innerHTML = templateEditor.ko.html;
            self.applyBinding();
        }
        public loadSurvey(surveyId: string) {
            var self = this;
            new Survey.dxSurveyService().loadSurvey(surveyId, function (success: boolean, result: string, response: any) {
                if (success && result) {
                    self.text = JSON.stringify(result);
                }
            });
        }
        public get text() {
            if (this.koIsShowDesigner()) return this.getSurveyTextFromDesigner();
            return this.jsonEditor != null ? this.jsonEditor.getValue() : "";
        }
        public set text(value: string) {
            this.textWorker = new SurveyTextWorker(value);
            if (this.textWorker.isJsonCorrect) {
                this.initSurvey(new Survey.JsonObject().toJsonObject(this.textWorker.survey));
                this.showDesigner();
                this.setUndoRedoCurrentState(true);
            } else {
                this.setTextValue(value);
                this.koViewType("editor");
            }
        }
        public get availableSurveiesOptionsList()  {
            var surveies = new Array;
            surveies.push({text: '-Select Survey'});
            jQuery.ajax({
                 url: "http://localhost:3000/get-surveies",
                 type: "get",
                 async: false,
                 success: function(data) {
                    var i = 1;
                    for (obj of data) {
                        surveies.push({
                            id: obj._id,
                            text: "Survey " + i,
                        });
                        i++;
                    }
                 }
            });
            return surveies;
        }
        protected setAvailableSurveiesOptionsList(value) {
            this.availableSurveiesOptionsList = value;
        }
        public get state(): string { return this.stateValue; }
        protected setState(value: string) {
            this.stateValue = value;
            this.koState(this.state);
        }
        saveNo: number = 0;
        protected doSave() {
            this.setState("saving")
            if (this.saveSurveyFunc) {
                this.saveNo++;
                var self = this;
                this.saveSurveyFunc(this.saveNo,
                    function doSaveCallback(no: number, isSuccess: boolean) {
                        self.setState("saved");
                        if (self.saveNo == no) {
                            if (isSuccess) self.setState("saved");
                            //else TODO
                        }
                    });
            }
        }
        protected setModified() {
            this.setState("modified");
            this.setUndoRedoCurrentState();
        }
        private setUndoRedoCurrentState(clearState: boolean = false) {
            if (clearState) {
                this.undoRedo.clear();
            }
            var selObj = this.koSelectedObject() ? this.koSelectedObject().value : null;
            this.undoRedo.setCurrent(this.surveyValue, selObj ? selObj.name : null);
        }
        public get saveSurveyFunc() { return this.saveSurveyFuncValue; }
        public set saveSurveyFunc(value: any) {
            this.saveSurveyFuncValue = value;
            this.koShowSaveButton(value != null);
        }
        public get showOptions() { return this.koShowOptions(); }
        public set showOptions(value: boolean) { this.koShowOptions(value); }
        private setTextValue(value: string) {
            this.isProcessingImmediately = true;
            if (this.jsonEditor) {
                this.jsonEditor.setValue(value);
                this.jsonEditor.renderer.updateFull(true);
            }
            this.processJson(value);
            this.isProcessingImmediately = false;
        }
        public addPage() {
            var name = SurveyHelper.getNewPageName(this.survey.pages);
            var page = <Survey.Page>this.surveyValue.addNewPage(name);
            this.addPageToUI(page);
            this.setModified();
        }
        public getLocString(str: string) { return editorLocalization.getString(str); }
        protected getQuestionTypes(): string[] {
            var allTypes = Survey.QuestionFactory.Instance.getAllTypes();
            if (!this.options || !this.options.questionTypes || !this.options.questionTypes.length) return allTypes;
            var result = [];
            for (var i = 0; i < this.options.questionTypes.length; i++) {
                var questionType = this.options.questionTypes[i];
                if (allTypes.indexOf(questionType) > -1) {
                    result.push(questionType);
                }
            }
            return result;
        }
        private movePage(indexFrom: number, indexTo: number) {
            var page = <Survey.Page>this.survey.pages[indexFrom];
            this.survey.pages.splice(indexFrom, 1);
            this.survey.pages.splice(indexTo, 0, page);
            this.pagesEditor.survey = this.survey;
            this.surveyObjects.selectObject(page)
            this.setModified();
        }
        private addPageToUI(page: Survey.Page) {
            this.pagesEditor.survey = this.surveyValue;
            this.surveyObjects.addPage(page);
        }
        private onQuestionAdded(question: Survey.QuestionBase) {
            var page = <Survey.Page>this.survey.getPageByQuestion(question);
            this.surveyObjects.addQuestion(page, question);
            this.survey.render();
        }
        private onQuestionRemoved(question: Survey.QuestionBase) {
            this.surveyObjects.removeObject(question);
            this.survey.render();
        }
        private onPropertyValueChanged(property: Survey.JsonObjectProperty, obj: any, newValue: any) {
            var isDefault = property.isDefaultValue(newValue);
            obj[property.name] = newValue;
            if (property.name == "name") {
                this.surveyObjects.nameChanged(obj);
                if (SurveyHelper.getObjectType(obj) == ObjType.Page) {
                    this.pagesEditor.changeName(<Survey.Page>obj);
                }
            }
            this.setModified();
            this.survey.render();
        }
        private doUndoRedo(item: UndoRedoItem) {
            this.initSurvey(item.surveyJSON);
            if (item.selectedObjName) {
                var selObj = this.findObjByName(item.selectedObjName);
                if (selObj) {
                    this.surveyObjects.selectObject(selObj);
                }
            }
            this.setState(this.undoRedo.koCanUndo() ? "modified" : "saved");
        }
        private findObjByName(name: string): Survey.Base {
            var page = this.survey.getPageByName(name);
            if (page) return page;
            var question = <Survey.QuestionBase>this.survey.getQuestionByName(name);
            if (question) return question;
            return null;
        }
        private canSwitchViewType(newType: string): boolean {
            if (newType && this.koViewType() == newType) return false;
            if (this.koViewType() != "editor" || !this.textWorker) return true;
            if (!this.textWorker.isJsonCorrect) {
                alert(this.getLocString("ed.correctJSON"));
                return false;
            }
            this.initSurvey(new Survey.JsonObject().toJsonObject(this.textWorker.survey));
            return true;
        }
        private showDesigner() {
            if (!this.canSwitchViewType("designer")) return;
            this.koViewType("designer");
        }
        private addNewSurvey() {

            this.text = "{pages: [{name: 'page1'}]}";
            this.surveyId = "";
            this.showDesigner();
        }
        private removeSurvey(e, element) {
            var self = this;
            $("#remove").toggleClass('disabled');
            var survey = jQuery('#surveies option:selected').val();
            $.ajax({
                url: "http://localhost:3000/remove-survey/" + survey,
                type: 'GET',
                beforeSend: function() {
                    self.notify = jQuery.notify({
                        title: "Removing Survey",
                        message: "<strong>Removing Survey</strong>Do not close this page...",
                        animate: {
                            enter: "animated fadeInDown",
                            exit: "animated fadeOutUp"
                        },
                    });
                 },
                 success: function(data) {
                    //
                 },
                 complete: function() {
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
        }
        private showActions() {
            if (!this.canSwitchViewType("actions")) return;
            this.koViewType("actions");
        }
        private availableSurveySelect(e, element) {
            var self = this;
            var survey = jQuery('#surveies option:selected').val();
            if(survey != '') {
                jQuery.ajax({
                    url: "http://localhost:3000/get-survey/" + survey,
                    async: false,
                    method: 'GET',
                    success: function(data) {
                        console.log(data);
                        self.text = data[0].text;
                        self.surveyId = data[0]._id;
                    }
                });
            }
        }
        private saveSurvey(e, element) {
            jQuery('#save').toggleClass('disabled');
            var self = this;
            var data = { 
                survey: this.text 
            };
            if(this.surveyId) {
                data.surveyId = this.surveyId;
            }
            jQuery.ajax({
                 url: "http://localhost:3000/save-survey",
                 type: "POST",
                 data: data, // Access property with <object>.<property>
                 beforeSend: function() {
                    self.notify =  jQuery.notify({
                        title: "Saving Survey",
                        message: "<strong>Saving Survey</strong>Do not close this page...",
                        animate: {
                            enter: "animated fadeInDown",
                            exit: "animated fadeOutUp"
                        },
                    });
                 },
                 success: function(data) {
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
        }
        private showJsonEditor() {
            if (this.koViewType() == "editor") return;
            this.jsonEditor.setValue(this.getSurveyTextFromDesigner());
            this.jsonEditor.focus();
            this.koViewType("editor");
        }
        private showTestSurvey() {
            if (!this.canSwitchViewType(null)) return;
            this.showLiveSurvey();
            this.koViewType("test");
        }
        private showEmbedEditor() {
            if (!this.canSwitchViewType("embed")) return;
            this.showSurveyEmbeding();
            this.koViewType("embed");
        }
        private getSurveyTextFromDesigner() {
            var json = new Survey.JsonObject().toJsonObject(this.survey);
            if (this.options && this.options.generateValidJSON) return JSON.stringify(json, null, 1);
            return new SurveyJSON5().stringify(json, null, 1);
        }
        private selectedObjectChanged(obj: Survey.Base) {
            var canDeleteObject = false;
            this.selectedObjectEditor.selectedObject = obj;
            this.surveyVerbs.obj = obj;
            var objType = SurveyHelper.getObjectType(obj);
            if (objType == ObjType.Page) {
                this.survey.currentPage = <Survey.Page>obj;
                canDeleteObject = this.survey.pages.length > 1;
            }
            if (objType == ObjType.Question) {
                this.survey["setselectedQuestion"](obj);
                canDeleteObject = true;
                this.survey.currentPage = this.survey.getPageByQuestion(this.survey["selectedQuestionValue"]);
            } else {
                this.survey["setselectedQuestion"](null);
            }
            this.koCanDeleteObject(canDeleteObject);
        }
        
        private applyBinding() {
            if (this.renderedElement == null) return;
            ko.cleanNode(this.renderedElement);
            ko.applyBindings(this, this.renderedElement);
            this.surveyjs = document.getElementById("surveyjs");
            if (this.surveyjs) {
                var self = this;
                this.surveyjs.onkeydown = function (e) {
                    if (!e) return;
                    if (e.keyCode == 46) self.deleteQuestion();
                    if (e.keyCode == 38 || e.keyCode == 40) {
                        self.selectQuestion(e.keyCode == 38);
                    }
                };
            }
            this.jsonEditor = ace.edit("surveyjsEditor");
            this.surveyjsExample = document.getElementById("surveyjsExample");

            this.initSurvey(new SurveyJSON5().parse(SurveyEditor.defaultNewSurveyText));
            this.setUndoRedoCurrentState(true);
            this.surveyValue.mode = "designer";
            this.surveyValue.render(this.surveyjs);

            this.initJsonEditor();
            SurveyTextWorker.newLineChar = this.jsonEditor.session.doc.getNewLineCharacter();
        }
        private initJsonEditor() {
            var self = this;
            this.jsonEditor.setTheme("ace/theme/monokai");
            this.jsonEditor.session.setMode("ace/mode/json");
            this.jsonEditor.setShowPrintMargin(false);
            this.jsonEditor.getSession().on("change", function () {
                self.onJsonEditorChanged();
            });
            this.jsonEditor.getSession().setUseWorker(true);
        }
        private initSurvey(json: any) {
            this.surveyValue = new Survey.Survey(json);
            if (this.surveyValue.isEmpty) {
                this.surveyValue = new Survey.Survey(new SurveyJSON5().parse(SurveyEditor.defaultNewSurveyText));
            }
            this.survey.mode = "designer";
            this.survey.render(this.surveyjs);
            this.surveyObjects.survey = this.survey;
            this.pagesEditor.survey = this.survey;
            this.pagesEditor.setSelectedPage(<Survey.Page>this.survey.currentPage);
            this.surveyVerbs.survey = this.survey;
            var self = this;
            this.surveyValue["onSelectedQuestionChanged"].add((sender: Survey.Survey, options) => { self.surveyObjects.selectObject(sender["selectedQuestionValue"]); });
            this.surveyValue["onCopyQuestion"].add((sender: Survey.Survey, options) => { self.copyQuestion(self.koSelectedObject().value); });
            this.surveyValue["onCreateDragDropHelper"] = function () { return self.createDragDropHelper() };
            this.surveyValue.onProcessHtml.add((sender: Survey.Survey, options) => { options.html = self.processHtml(options.html); });
            this.surveyValue.onCurrentPageChanged.add((sender: Survey.Survey, options) => { self.pagesEditor.setSelectedPage(<Survey.Page>sender.currentPage); });
            this.surveyValue.onQuestionAdded.add((sender: Survey.Survey, options) => { self.onQuestionAdded(options.question); });
            this.surveyValue.onQuestionRemoved.add((sender: Survey.Survey, options) => { self.onQuestionRemoved(options.question); });
        }
        private processHtml(html: string): string {
            if (!html) return html;
            var scriptRegEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            while (scriptRegEx.test(html)) {
                html = html.replace(scriptRegEx, "");
            }
            return html;
        }
        private timeoutId: number = -1;
        private onJsonEditorChanged(): any {
            if (this.timeoutId > -1) {
                clearTimeout(this.timeoutId);
            }   
            if (this.isProcessingImmediately) {
                this.timeoutId = -1;
            } else {
                var self = this;
                this.timeoutId = setTimeout(function () {
                    self.timeoutId = -1;
                    self.processJson(self.text);
                }, SurveyEditor.updateTextTimeout);
            }
        }
        private processJson(text: string): any {
            this.textWorker = new SurveyTextWorker(text);
            if (this.jsonEditor) {
                this.jsonEditor.getSession().setAnnotations(this.createAnnotations(text, this.textWorker.errors));
            }
        }
        private doDraggingQuestion(questionType: any, e) {
            this.createDragDropHelper().startDragNewQuestion(e, questionType, this.getNewQuestionName());
        }
        private doDraggingCopiedQuestion(json: any, e) {
            this.createDragDropHelper().startDragCopiedQuestion(e, this.getNewQuestionName(), json);
        }
        private createDragDropHelper(): DragDropHelper {
            var self = this;
            return new DragDropHelper(<Survey.ISurvey>this.survey, function () { self.setModified() });
        }
        private doClickQuestion(questionType: any) {
            this.doClickQuestionCore(Survey.QuestionFactory.Instance.createQuestion(questionType, this.getNewQuestionName()));
        }
        private doClickCopiedQuestion(json: any) {
            var name = this.getNewQuestionName();
            var question = Survey.QuestionFactory.Instance.createQuestion(json["type"], name);
            new Survey.JsonObject().toObject(json, question);
            question.name = name;
            this.doClickQuestionCore(question);
        }
        private getNewQuestionName(): string {
            return SurveyHelper.getNewQuestionName(this.survey.getAllQuestions());
        }
        private doClickQuestionCore(question: Survey.QuestionBase) {
            var page = this.survey.currentPage;
            var index = -1;
            if (this.survey["selectedQuestionValue"] != null) {
                index = page.questions.indexOf(this.survey["selectedQuestionValue"]) + 1;
            }
            page.addQuestion(question, index);
            this.setModified();
        }
        private deleteQuestion() {
            var question = this.getSelectedObjAsQuestion();
            if (question) {
                this.deleteCurrentObject();
            }
        }
        private selectQuestion(isUp: boolean) {
            var question = this.getSelectedObjAsQuestion();
            if (question) {
                this.surveyObjects.selectNextQuestion(isUp)
            }
        }
        private getSelectedObjAsQuestion(): Survey.QuestionBase {
            var obj = this.koSelectedObject().value;
            if (!obj) return null;
            return SurveyHelper.getObjectType(obj) == ObjType.Question ? <Survey.QuestionBase>(obj): null;
        }
        private deleteCurrentObject() {
            this.deleteObject(this.koSelectedObject().value);
        }
        public copyQuestion(question: Survey.QuestionBase) {
            var objType = SurveyHelper.getObjectType(question);
            if (objType != ObjType.Question) return;
            var json = new Survey.JsonObject().toJsonObject(question);
            json.type = question.getType();
            var item = this.getCopiedQuestionByName(question.name);
            if (item) {
                item.json = json;
            } else {
                this.koCopiedQuestions.push({ name: question.name, json: json });
            }
            if (this.koCopiedQuestions().length > 3) {
                this.koCopiedQuestions.splice(0, 1);
            }
        }
        private getCopiedQuestionByName(name: string) {
            var items = this.koCopiedQuestions();
            for (var i = 0; i < items.length; i++) {
                if (items[i].name == name) return items[i];
            }
            return null;
        }
        private deleteObject(obj: any) {
            this.surveyObjects.removeObject(obj);
            var objType = SurveyHelper.getObjectType(obj);
            if (objType == ObjType.Page) {
                this.survey.removePage(obj);
                this.pagesEditor.removePage(obj);
                this.setModified();
            }
            if (objType == ObjType.Question) {
                this.survey.currentPage.removeQuestion(obj);
                this.survey["setselectedQuestion"](null);
                this.surveyObjects.selectObject(this.survey.currentPage);
                this.setModified();
            }
            this.survey.render();
        }
        private showLiveSurvey() {
            if (!this.surveyjsExample) return;
            var json = this.getSurveyJSON();
            if (json != null) {
                if (json.cookieName) {
                    delete json.cookieName;
                }
                var survey = new Survey.Survey(json);
                var self = this;
                var surveyjsExampleResults = document.getElementById("surveyjsExampleResults");
                var surveyjsExamplereRun = document.getElementById("surveyjsExamplereRun");
                if (surveyjsExampleResults) surveyjsExampleResults.innerHTML = "";
                if (surveyjsExamplereRun) surveyjsExamplereRun.style.display = "none";
                survey.onComplete.add((sender: Survey.Survey) => { if (surveyjsExampleResults) surveyjsExampleResults.innerHTML = this.getLocString("ed.surveyResults") + JSON.stringify(survey.data); if (surveyjsExamplereRun) surveyjsExamplereRun.style.display = ""; });
                survey.render(this.surveyjsExample);
            } else {
                this.surveyjsExample.innerHTML = this.getLocString("ed.correctJSON");
            }
        }
        private showSurveyEmbeding() {
            var json = this.getSurveyJSON();
            this.surveyEmbeding.json = json;
            this.surveyEmbeding.surveyId = this.surveyId;
            this.surveyEmbeding.surveyPostId = this.surveyPostId;
            this.surveyEmbeding.generateValidJSON = this.options && this.options.generateValidJSON;
            this.surveyEmbeding.show();
        }
        private getSurveyJSON(): any {
            if (this.koIsShowDesigner())  return new Survey.JsonObject().toJsonObject(this.survey);
            if (this.textWorker.isJsonCorrect) return new Survey.JsonObject().toJsonObject(this.textWorker.survey);
            return null;
        }
        private createAnnotations(text: string, errors: any[]): AceAjax.Annotation[] {
            var annotations = new Array<AceAjax.Annotation>();
            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];
                var annotation: AceAjax.Annotation = { row: error.position.start.row, column: error.position.start.column, text: error.text, type: "error" };
                annotations.push(annotation);
            }
            return annotations;
        }
    }

    new Survey.SurveyTemplateText().replaceText(template_page.html, "page");
    new Survey.SurveyTemplateText().replaceText(template_question.html, "question");

    Survey.Survey.prototype["onCreating"] = function () {
        this.selectedQuestionValue = null;
        this.onSelectedQuestionChanged = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
        this.onCopyQuestion = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
        this.onCreateDragDropHelper = null;
        var self = this;
        this.copyQuestionClick = function () { self.onCopyQuestion.fire(self); };
    }
    Survey.Survey.prototype["setselectedQuestion"] = function(value: Survey.QuestionBase) {
        if (value == this.selectedQuestionValue) return;
        var oldValue = this.selectedQuestionValue;
        this.selectedQuestionValue = value;
        if (oldValue != null) {
            oldValue["onSelectedQuestionChanged"]();
        }
        if (this.selectedQuestionValue != null) {
            this.selectedQuestionValue["onSelectedQuestionChanged"]();
        }
        this.onSelectedQuestionChanged.fire(this, { 'oldSelectedQuestion': oldValue, 'newSelectedQuestion': value });
    }
    Survey.Survey.prototype["getEditorLocString"] = function (value: string): string {
        return editorLocalization.getString(value);
    }
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
        this.koDraggingQuestion.subscribe(function (newValue) { if (newValue) newValue.koIsDragging(true); });
        this.koDraggingQuestion.subscribe(function (oldValue) { if (oldValue) oldValue.koIsDragging(false); }, this, "beforeChange");
        this.dragEnter = function (e) { e.preventDefault(); self.dragEnterCounter++; self.doDragEnter(e); };
        this.dragLeave = function (e) { self.dragEnterCounter--; if (self.dragEnterCounter === 0) self.koDragging(-1); };
        this.dragDrop = function (e) { self.doDrop(e); };
    }
    Survey.Page.prototype["doDrop"] = function (e) {
        var dragDropHelper = this.data["onCreateDragDropHelper"] ? this.data["onCreateDragDropHelper"]() : new DragDropHelper(this.data, null);
        dragDropHelper.doDrop(e);
    }
    Survey.Page.prototype["doDragEnter"] = function(e) {
        if (this.questions.length > 0 || this.koDragging() > 0) return;
        if (new DragDropHelper(this.data, null).isSurveyDragging(e)) {
            this.koDragging(this.questions.length);
        }
    }

    Survey.QuestionBase.prototype["onCreating"] = function () {
        var self = this;
        this.dragDropHelperValue = null;
        this.koIsDragging = ko.observable(false);
        this.dragDropHelper = function () {
            if (self.dragDropHelperValue == null) {
                self.dragDropHelperValue = self.data["onCreateDragDropHelper"] ? self.data["onCreateDragDropHelper"]() : new DragDropHelper(self.data, null);;
            }
            return self.dragDropHelperValue;
        }
        this.dragOver = function (e) { self.dragDropHelper().doDragDropOver(e, self); }
        this.dragDrop = function (e) { self.dragDropHelper().doDrop(e, self); }
        this.dragStart = function (e) { self.dragDropHelper().startDragQuestion(e, self.name); }
        this.koIsSelected = ko.observable(false);
        this.koOnClick = function () {
            if (self.data == null) return;
            self.data["setselectedQuestion"](this);
        }
    }
    Survey.QuestionBase.prototype["onSelectedQuestionChanged"] = function() {
        if (this.data == null) return;
        this.koIsSelected(this.data["selectedQuestionValue"] == this);
    }
}
