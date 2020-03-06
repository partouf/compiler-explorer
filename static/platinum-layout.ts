const _ = require('underscore'),
    $ = require('jquery');

class PlatinumLayoutEventHub {
    events: object;

    constructor() {
       this.events = {};
    }

    on(eventName: string, func, ctx) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push({
            func: func,
            ctx: ctx
        });
    }

    emit(eventName: string, p1, p2) {
        _.forEach(this.events[eventName], (callback) => {
            _.bind(callback.func, callback.ctx)(p1, p2);
        });
    }
}

class PlatinumLayoutComponent extends PlatinumLayoutEventHub {
    title: string;
    componentName: string;
    isRow: boolean;
    isColumn: boolean;
    type: string;
    layoutManager: PlatinumLayout;
    contentItems: any;
    state: object;
    element: any;
    parent: PlatinumLayoutComponent;
    obj: any;
    config: object;

    constructor(layoutManager: PlatinumLayout) {
        super();

        this.layoutManager = layoutManager;
        this.contentItems = [];
        this.parent = layoutManager;
        this.config = {};
    }

    getElement() {
        return this.element;
    }

    setTitle(title) {
        this.title = title;
    }

    setState(state) {
        this.state = state;
    }

    toComponent(config) {
        if (config.type === 'row') {
            let component = new PlatinumLayoutComponent(this.layoutManager);
            component.parent = this;
            component.element = $('<div>');
            component.element.addClass('row');
            this.element.append(component.element);

            if (config.content) {
                for (let comp of config.content) {
                    component.contentItems.push(component.toComponent(comp));
                }
            }
        } else if (config.type === 'component') {
            let component = new PlatinumLayoutComponent(this.layoutManager);
            component.componentName = config.componentName;
            component.state = config.componentState;
            component.parent = this;

            component.element = $('<div>');
            component.element.addClass('container-fluid');
            this.element.append(component.element);
            
            component.obj = this.layoutManager.createComponent(config.componentName, component.state, component);
        }
    }

    addChild(elem) {
        this.toComponent(elem);
    }

    replaceChild(oldElem, newElem) {

    }
}

class PlatinumLayout extends PlatinumLayoutComponent {
    eventHub: PlatinumLayoutEventHub;
    factories: object;
    root: PlatinumLayoutComponent;

    constructor(defaultConfig, rootElement) {
        super(null);

        this.eventHub = new PlatinumLayoutEventHub();
        this.factories = {};

        this.root = new PlatinumLayoutComponent(this);

        this.element = $('<div>');
        this.element.addClass('container');

        rootElement.append(this.element);

        this.root.element = this.element;
    }

    registerComponent(componentName: string, factoryFunc) {
        this.factories[componentName] = factoryFunc;
    }

    createComponent(componentName, state, customParent) {
        return this.factories[componentName](customParent ? customParent : this.root, state);
    }

    createContentItem(config) {
        let comp = this.toComponent(config);
        return comp;
    }

/*
    var newRow = this.layout.createContentItem({type: 'row'}, this.layout.root);
    this.layout.root.replaceChild(rootFirstItem, newRow);
    newRow.addChild(rootFirstItem);
    newRow.addChild(newElem);
 */
    init() {

    }

    createDragSource(thing, func) {
        return {
            _dragListener: new PlatinumLayoutEventHub()
        };
    }

    updateSize() {

    }

    toConfig() {
        return {};
    }
}

export = PlatinumLayout;
