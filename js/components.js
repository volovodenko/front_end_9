;(function (w) {
    "use strict";

    /**
     * Buffer for components
     * @returns {function} - operations with buffer
     */
    var componentsBuffer = (function () {
        var buffer = [];

        function bufferOps(data) {
            return data ? buffer.push(data) : buffer;
        }

        return bufferOps;
    })();

    /**
     * Constructor for components
     * @param options - input object
     * @constructor
     */
    var Component = function (options) {
        this.options = options;
        this._order = 0;
        this._name = options.name;
        this._rendered = false;
        this._view = null;

        componentsBuffer(this);
    };

    /**
     * Set render order for components
     * @param order - number
     */
    Component.prototype.setOrder = function (order) {
        var orderNum = +order;

        if (!isNaN(orderNum)) {
            this._order = orderNum;
        }
    };

    /**
     * Set html view for components
     * @param view - parent html string
     * @param data - data(object) for view
     */
    Component.prototype.setView = function (view, data) {
        var element = document.createElement(this.options.parent);

        if (data) {
            var viewChild;

            switch (this._name) {
                case "menu":
                    viewChild = '<li><a href="{url}">{name}</a>{submenu}</li>';
                    break;

                case "articles":
                    viewChild = '<article><a href="{url}">{name}</a> {text}</article>';
                    break;

                case "about":
                    viewChild = '<li>{name} {surname}, {age} лет, {from}, <a href="{profile}">profile</a></li>';
                    break;
            }

            element.innerHTML = this.createView(view, data, viewChild);

            if (this._name === "menu") {
                element.querySelectorAll('a').forEach(function (link) {
                    link.addEventListener('click', Component.bindMenuClick);
                });
            }

        } else {
            element.innerHTML = replacer(view, this.options);
        }

        this._view = element;
    };

    /**
     * Bind click event for menu item
     * @param event
     */
    Component.bindMenuClick = function (event) {
        var newComponent = this.getAttribute('href');

        if (newComponent !== "#") {
            var viewParent = document.querySelector(window[newComponent].options.parent);

            if (viewParent) {
                var components = componentsBuffer();

                for (var i in components) {
                    if (components[i]._view === viewParent) {
                        components[i]._rendered = false;
                        break;
                    }
                }

                viewParent.remove();
            }

            Component.renderPage(w[newComponent]);
        }

        event.preventDefault();
    };

    /**
     * Create html view for components
     * @param view - parent html string
     * @param data - data(object) for view
     * @param viewChild - child html string for view
     * @returns {string | * | void} - created html string
     */
    Component.prototype.createView = function (view, data, viewChild) {
        var item = "";
        var newView;
        var subMenu;
        var newViewChild;

        for (var value in data) {
            subMenu = "";

            if (data[value].hasOwnProperty('items')) {
                subMenu = this.createView(
                    '<ul class="submenu">{li}</ul>',
                    data[value]['items'],
                    '<li><a href="{url}">{name}</a>{submenu}</li>'
                );
            }

            newViewChild = viewChild.replace(/\{submenu\}/, subMenu);
            item += replacer(newViewChild, data[value]);
        }

        newView = view.replace(/\{\w*\}/g, item);
        return newView;
    };

    /**
     * Render components view
     */
    Component.renderPage = function () {
        var viewBody = document.querySelector('body');
        var components = [].slice.call(arguments);

        components.sort(compareOrder);

        components.map(function (component) {
            components.length === 1
                ? viewBody.insertBefore(component._view, componentFooter._view)
                : viewBody.appendChild(component._view);

            component._rendered = true;
            console.log(component._name + " rendered");
        });
    };

    /**
     * Delete component from document
     */
    Component.prototype.delete = function () {
        this._view.remove();
    };

    /**
     * Fill string with real data
     * @param string - input html string
     * @param data - data(object) for string
     * @returns {*} - real data filled html string
     */
    function replacer(string, data) {
        var newString = string;

        for (var value in data) {
            if (data.hasOwnProperty(value)) {
                var regexp = new RegExp('{' + value + '}', 'g');

                newString = newString.replace(regexp, data[value]);
            }
        }

        return newString;
    }

    /**
     * Compare for components sort
     * @param component1
     * @param component2
     * @returns {number}
     */
    function compareOrder(component1, component2) {
        if (component1["_order"] > component2["_order"]) return 1;
        if (component1["_order"] < component2["_order"]) return -1;
    }

    w.Component = Component;

})(window);