
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function (d3$1) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement !== 'undefined') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set() {
                // overridden by instance, if it has props
            }
        };
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/article/Figure.svelte generated by Svelte v3.12.1 */

    const file = "src/article/Figure.svelte";

    const get_caption_slot_changes = () => ({});
    const get_caption_slot_context = () => ({});

    function create_fragment(ctx) {
    	var figure, div, t, caption, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const caption_slot_template = ctx.$$slots.caption;
    	const caption_slot = create_slot(caption_slot_template, ctx, get_caption_slot_context);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div = element("div");

    			if (default_slot) default_slot.c();
    			t = space();
    			caption = element("caption");

    			if (caption_slot) caption_slot.c();

    			attr_dev(div, "class", "figure-container svelte-jpfwvv");
    			add_location(div, file, 54, 2, 1255);

    			attr_dev(caption, "class", "svelte-jpfwvv");
    			add_location(caption, file, 57, 2, 1310);
    			attr_dev(figure, "class", "svelte-jpfwvv");
    			add_location(figure, file, 53, 0, 1244);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);

    			if (caption_slot) caption_slot.l(caption_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(figure, t);
    			append_dev(figure, caption);

    			if (caption_slot) {
    				caption_slot.m(caption, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (caption_slot && caption_slot.p && changed.$$scope) {
    				caption_slot.p(
    					get_slot_changes(caption_slot_template, ctx, changed, get_caption_slot_changes),
    					get_slot_context(caption_slot_template, ctx, get_caption_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(caption_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(caption_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(figure);
    			}

    			if (default_slot) default_slot.d(detaching);

    			if (caption_slot) caption_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { $$slots, $$scope };
    }

    class Figure extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Figure", options, id: create_fragment.name });
    	}
    }

    var createCanvas = function (width, height) {
      return Object.assign(document.createElement('canvas'), { width: width, height: height })
    };

    /* Copyright 2019 Google LLC All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
      ==============================================================================*/

    // Gaussian generator, mean = 0, std = 1.
    var normal = d3$1.randomNormal();

    // Create random Gaussian vector.
    function normalVector(dim) {
      var p = [];
      for (var j = 0; j < dim; j++) {
        p[j] = normal();
      }
      return p;
    }

    // Scale the given vector.
    function scale(vector, a) {
      for (var i = 0; i < vector.length; i++) {
        vector[i] *= a;
      }
    }

    // Add two vectors.
    function add(a, b) {
      var n = a.length;
      var c = [];
      for (var i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
      }
      return c;
    }

    // A point with color info.
    class Point {
      constructor(coords, color) {
        this.coords = coords;
        this.color = color || "#039";
      }
    }

    // Adds colors to points depending on 2D location of original.
    function addSpatialColors(points) {
      var xExtent = d3$1.extent(points, function(p) {
        return p.coords[0];
      });
      var yExtent = d3$1.extent(points, function(p) {
        return p.coords[1];
      });
      var xScale = d3$1.scaleLinear()
        .domain(xExtent)
        .range([0, 255]);
      var yScale = d3$1.scaleLinear()
        .domain(yExtent)
        .range([0, 255]);
      points.forEach(function(p) {
        var c1 = ~~xScale(p.coords[0]);
        var c2 = ~~yScale(p.coords[1]);
        p.color = "rgb(20," + c1 + "," + c2 + ")";
      });
    }

    // Convenience function to wrap 2d arrays as Points, using a default
    // color scheme.
    function makePoints(originals) {
      var points = originals.map(function(p) {
        return new Point(p);
      });
      addSpatialColors(points);
      return points;
    }

    // Data in shape of 2D grid.
    function gridData(size) {//(1,2)
      var points = [];
      for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
          points.push([x, y]);
        }
      }
      return makePoints(points);
    }

    // Gaussian cloud, symmetric, of given dimension.
    function gaussianData(n, dim=100) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var p = normalVector(dim);
        points.push(new Point(p));
      }
      return points;
    }

    // Elongated Gaussian ellipsoid.
    function longGaussianData(n, dim=100) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var p = normalVector(dim);
        for (var j = 0; j < dim; j++) {
          p[j] /= 1 + j;
        }
        points.push(new Point(p));
      }
      return points;
    }

    // Return a color for the given angle.
    function angleColor(t) {
      var hue = ~~((300 * t) / (2 * Math.PI));
      return "hsl(" + hue + ",50%,50%)";
    }

    // Data in a 2D circle, regularly spaced.
    function circleData(numPoints) {
      var points = [];
      
      for (var i = 0; i < numPoints; i++) {
        var t = (2 * Math.PI * i) / numPoints;
        points.push(new Point([Math.cos(t), Math.sin(t)], angleColor(t)));
      }
      return points;
    }

    // Random points on a 2D circle.
    function SeededRandomGenerator(seed) {
      var m = 0x80000000; // 2**31
      var a = 1103515245;
      var c = 12345;
  
      this.state = seed ? seed : Math.floor(Math.random() * (m-1));
      this.next = function() {
          this.state = (a * this.state + c) % m;
          return this.state / (m - 1);
      }
  }
  
  function saveTextAsFile(text, filename) {
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    var link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function randomCircleData(numPoints) {
  var points = [];
  var random = new SeededRandomGenerator(numPoints);
  for (var i = 0; i < numPoints; i++) {
    var t = 2 * Math.PI * random.next();
    points.push(new Point([Math.cos(t), Math.sin(t)], angleColor(t)));
 
  }
  return points;
}



  

    // Two clusters of the same size.
    function twoClustersData(n, dim) {
      dim = dim || 50;
      var points = [];
      for (var i = 0; i < n; i++) {
        points.push(new Point(normalVector(dim), "#039"));
        var v = normalVector(dim);
        v[0] += 10;
        points.push(new Point(v, "#f90"));
      }
      return points;
    }

    // Two differently sized clusters, of arbitrary dimensions.
    function twoDifferentClustersData(n, dim, scale=10) {
      dim = dim || 50;
      scale = scale || 10;
      var points = [];
      for (var i = 0; i < n; i++) {
        points.push(new Point(normalVector(dim), "#039"));
        var v = normalVector(dim);
        for (var j = 0; j < dim; j++) {
          v[j] /= scale;
        }
        v[0] += 20;
        points.push(new Point(v, "#f90"));
      }
      return points;
    }

    // Three clusters, at different distances from each other, in any dimension.
    function threeClustersData(n, dim) {
      dim = dim || 50;
      var points = [];
      for (var i = 0; i < n; i++) {
        var p1 = normalVector(dim);
        points.push(new Point(p1, "#039"));
        var p2 = normalVector(dim);
        p2[0] += 10;
        points.push(new Point(p2, "#f90"));
        var p3 = normalVector(dim);
        p3[0] += 50;
        points.push(new Point(p3, "#6a3"));
      }
      return points;
    }

    // One tiny cluster inside of a big cluster.
    function subsetClustersData(n, dim) {
      dim = dim || 2;
      var points = [];
      for (var i = 0; i < n; i++) {
        var p1 = normalVector(dim);
        points.push(new Point(p1, "#039"));
        var p2 = normalVector(dim);
        scale(p2, 50);
        points.push(new Point(p2, "#f90"));
      }
      return points;
    }

    // Data in a rough simplex.
    function simplexData(n, noise) {
      noise = noise || 0.5;
      var points = [];
      for (var i = 0; i < n; i++) {
        var p = [];
        for (var j = 0; j < n; j++) {
          p[j] = i == j ? 1 + noise * normal() : 0;
        }
        points.push(new Point(p));
      }
      return points;
    }

    // Uniform points from a cube.
    function cubeData(n, dim) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var p = [];
        for (var j = 0; j < dim; j++) {
          p[j] = Math.random();
        }
        points.push(new Point(p));
      }
      return points;
    }

    // Points in two unlinked rings.
    function unlinkData(n) {
      var points = [];
      function rotate(x, y, z) {
        var u = x;
        var cos = Math.cos(0.4);
        var sin = Math.sin(0.4);
        var v = cos * y + sin * z;
        var w = -sin * y + cos * z;
        return [u, v, w];
      }
      for (var i = 0; i < n; i++) {
        var t = (2 * Math.PI * i) / n;
        var sin = Math.sin(t);
        var cos = Math.cos(t);
        // Ring 1.
        points.push(new Point(rotate(cos, sin, 0), "#f90"));
        // Ring 2.
        points.push(new Point(rotate(3 + cos, 0, sin), "#039"));
      }
      return points;
    }

    // Points in linked rings.
    function linkData(n) {
      var points = [];
      function rotate(x, y, z) {
        var u = x;
        var cos = Math.cos(0.4);
        var sin = Math.sin(0.4);
        var v = cos * y + sin * z;
        var w = -sin * y + cos * z;
        return [u, v, w];
      }
      for (var i = 0; i < n; i++) {
        var t = (2 * Math.PI * i) / n;
        var sin = Math.sin(t);
        var cos = Math.cos(t);
        // Ring 1.
        points.push(new Point(rotate(cos, sin, 0), "#f90"));
        // Ring 2.
        points.push(new Point(rotate(1 + cos, 0, sin), "#039"));
      }
      return points;
    }

    // Points in a trefoil knot.
    function trefoilData(n) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var t = (2 * Math.PI * i) / n;
        var x = Math.sin(t) + 2 * Math.sin(2 * t);
        var y = Math.cos(t) - 2 * Math.cos(2 * t);
        var z = -Math.sin(3 * t);
        points.push(new Point([x, y, z], angleColor(t)));
      }
      return points;
    }

    // Two long, linear clusters in 2D.
    function longClusterData(n) {
      var points = [];
      var s = 0.03 * n;
      for (var i = 0; i < n; i++) {
        var x1 = i + s * normal();
        var y1 = i + s * normal();
        points.push(new Point([x1, y1], "#039"));
        var x2 = i + s * normal() + n / 5;
        var y2 = i + s * normal() - n / 5;
        points.push(new Point([x2, y2], "#f90"));
      }
      return points;
    }

    // Mutually orthogonal steps.
    function orthoCurve(n) {
      if(n==950)
        n=900;
      var points = [];
      for (var i = 0; i < n; i++) {
        var coords = [];
        for (var j = 0; j < n; j++) {
          coords[j] = j < i ? 1 : 0;
        }
        var t = (1.5 * Math.PI * i) / n;
        points.push(new Point(coords, angleColor(t)));
      }
      return points;
    }

    // Random walk
    function randomWalk(n, dim) {
      var points = [];
      var current = [];
      for (var i = 0; i < dim; i++) {
        current[i] = 0;
      }
      for (var i = 0; i < n; i++) {
        var step = normalVector(dim);
        var next = current.slice();
        for (var j = 0; j < dim; j++) {
          next[j] = current[j] + step[j];
        }
        var t = (1.5 * Math.PI * i) / n;
        points.push(new Point(next, angleColor(t)));      
        current = next;
      }
      return points;
    }

    // Random jump: a random walk with
    // additional noise added at each step.
    function randomJump(n, dim) {
      var points = [];
      var current = [];
      for (var i = 0; i < dim; i++) {
        current[i] = 0;
      }
      for (var i = 0; i < n; i++) {
        var step = normalVector(dim);
        var next = add(step, current.slice());
        var r = normalVector(dim);
        scale(r, Math.sqrt(dim));
        var t = (1.5 * Math.PI * i) / n;
        var coords = add(r, next);
        points.push(new Point(coords, angleColor(t)));
        current = next;
      }
      return points;
    }

    function multiplyScalar(vector, x) {
      return vector.map(val => val * x);
    }

    function addNoise(vector, x) {
      return vector.map(val => {
        const noise = Math.random() * x - x / 2;
        return val + noise;
      });
    }

    function star(n, nArms, dim) {
      const points = [];
      const pointsPerArm = Math.floor(n / nArms);
      for (let i = 0; i < nArms; i++) {
        const color = angleColor((Math.PI * 2 * i) / nArms);
        const armVector = normalVector(dim);
        for (let i = 0; i < pointsPerArm; i++) {
          const percent = i / pointsPerArm;
          const noise = 0.01;
          const p = addNoise(multiplyScalar(armVector, percent), noise);
          points.push(new Point(p, color));
        }
      }
      return points;
    }

    function interpolate(a, b, percent) {
      return a.map((val, i) => {
        const d = b[i] - val;
        return d * percent + val;
      });
    }

    function linkedClusters(nClusters, perCluster, perLink, dim=5) {//1,2
      const points = [];
      const centroids = [];

      for (let i = 0; i < nClusters; i++) {
        const color = angleColor((Math.PI * 2 * i) / nClusters);
        const centroid = normalVector(dim);
        centroids.push(centroid);

        for (let i = 0; i < perCluster; i++) {
          const p = addNoise(centroid, 0.2);
          points.push(new Point(p, color));
        }

        if (i > 0) {
          const lastCentroid = centroids[i - 1];
          for (let i = 0; i < perLink; i++) {
            const percent = i / perLink;
            const p = interpolate(centroid, lastCentroid, percent);
            points.push(new Point(addNoise(p, 0.01), "darkgray"));
          }
        }
      }
      return points;
    }

    function drawLine(ctx, angle, nPixels) {
      const center = nPixels / 2;
      const lineDistance = nPixels * 2;

      ctx.fillStyle = "#000";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;

      ctx.fillRect(0, 0, nPixels, nPixels);

      const dY = Math.sin(angle) * lineDistance;
      const dX = Math.cos(angle) * lineDistance;

      ctx.beginPath();
      ctx.moveTo(center - dX, center - dY);
      ctx.lineTo(center + dX, center + dY);
      ctx.stroke();

      const { data } = ctx.getImageData(0, 0, nPixels, nPixels);
      const pixelData = [];
      for (let j = 0; j < data.length; j += 4) {
        pixelData.push(data[j]);
      }

      return pixelData;
    }

    function continuousLineImages(nLines, nPixels = 28) {
      const canvas = createCanvas(nPixels, nPixels);
      const ctx = canvas.getContext("2d");

      const output = [];
      for (let i = 0; i < nLines; i++) {
        const progress = i / nLines;
        const angle = Math.PI * progress;
        const pixelData = drawLine(ctx, angle, nPixels);

        output.push(new Point(pixelData, angleColor(angle)));
      
      }
      return output;
    }

    function clusteredLineImages(
      nLines,
      nClusters,
      noiseParam = 0,
      nPixels 
    ) {
      const canvas = createCanvas(nPixels, nPixels);
      const ctx = canvas.getContext("2d");

      const linesPerCluster = Math.floor(nLines / nClusters);

      const output = [];
      for (let i = 0; i < nClusters; i++) {
        const progress = i / nClusters;

        for (let j = 0; j < linesPerCluster; j++) {
          const noise = Math.random() * (noiseParam / 100) * Math.PI;
          const angle = Math.PI * progress + noise;
          const pixelData = drawLine(ctx, angle, nPixels);
          output.push(new Point(pixelData, angleColor(angle * 2)));

        }
      }
      return output;
    }

    function linePreview() {
      const nPixels = Array.prototype.slice.apply(arguments).pop();
      const output = [];
      for (let x = 0; x < nPixels; x++) {
        for (let y = 0; y < nPixels; y++) {
          const vector = [x, y];
          output.push(new Point(vector, y === x ? "aliceblue" : "black"));
        }
      }
      return output;
    }

    function lineClusterPreview() {
      const nPixels = Array.prototype.slice.apply(arguments).pop();
      const output = [];
      for (let x = 0; x < nPixels; x++) {
        for (let y = 0; y < nPixels; y++) {
          const vector = [x, y];
          output.push(new Point(vector, y === nPixels - x ? "aliceblue" : "black"));
        }
      }
      return output;
    }

    function sineFrequency(nVectors, vectorSize) {
      const minFreq = Math.PI / (2 * vectorSize);
      const maxFreq = Math.PI / ((1 / 10) * vectorSize);

      const output = [];
      for (let i = 0; i < nVectors; i++) {
        const progress = i / nVectors;
        const freq = (maxFreq - minFreq) * progress + minFreq;

        const vector = [];
        for (let x = 0; x < vectorSize; x++) {
          vector.push(Math.sin(freq * x));
        }
        output.push(new Point(vector, angleColor(Math.PI * 2 * progress)));
      }
      return output;
    }

    function sinePhase(nVectors, vectorSize) {
      const freq = (2 * Math.PI) / vectorSize;
      const phase = vectorSize / nVectors;

      const output = [];
      for (let i = 0; i < nVectors; i++) {
        const progress = i / nVectors;
        const phaseOffset = phase * progress;

        const vector = [];
        for (let x = 0; x < vectorSize; x++) {
          vector.push(Math.sin(freq * (x + phaseOffset)));
        }
        output.push(new Point(vector, angleColor(Math.PI * 2 * progress)));
      }
      return output;
    }

    function sinePreview(nPoints, angle) {
      const amplitude = nPoints / 2;
      const freq = Math.PI / (nPoints / 5);

      const output = [];
      for (let x = 0; x < nPoints; x++) {
        const vector = [x, Math.sin(freq * x) * amplitude];
        output.push(new Point(vector, angleColor(angle)));
      }
      return output;
    }

    function sineFreqPreview(nPoints) {
      return sinePreview(nPoints, 0);
    }

    function sinePhasePreview(nPoints) {
      return sinePreview(nPoints, Math.PI / 2);
    }

    /* Copyright 2019 Google LLC All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
      ==============================================================================*/

    const extendedDemos = [
      {
        name: "Star",
        description: "Star:\nPoints arranged in a radial star pattern",
        options: [
          {
            name: "1A. Number of points",
            min: 100,
            max: 250,
            start: 100
            ,step: 50
          },
          {
            name: "1B. Number of arms",
            min: 5,
            max: 15,
            start: 5
            ,step:5
          },
          {
            name: "1C. Dimensions",
            min: 5,
            max: 45,
            start: 5,
            step:20
          }
        ],
        generator: star
      },
      {
        name: "Linked Clusters",
        description: "Linked Clusters: Clusters linked with a chain of points",
        options: [
          {
            name: "2A. Number of clusters",
            min: 5,
            max: 15,
            start: 5
            ,step:5
          },
          {
            name: "2B. Points per cluster",
            min: 10,
            max: 30,
            start: 30
            ,step:10
          },
          {
            name: "2C. Points per link",
            min: 10,
            max: 30,
            start: 10
            ,step:20
          },
          {
            name: "2D. Dimensions",
            min: 5,
            max: 5,
            start: 5
          }
        ],
        generator: linkedClusters
      },
      {
        name: "Rotated Lines",
        description:
          "Rotated lines: nxn images of a line rotated smoothly around the center, represented as an n*n dimensional vector.",
        options: [
          {
            name: "3A. Number of lines",
            min: 80,
            max: 200,
            start: 200
            ,step: 40
          },
          {
            name: "3B. Pixels per side",
            min: 5,
            max: 20,
            start: 10
            ,step:5
          }
        ],
        generator: continuousLineImages,
        previewOverride: linePreview
      },
      {
        name: "Rotated Lines, clustered",
        description:
          "Clustered Rotated Lines: nxn images of a line rotated around the center, represented as an n by n dimensional vector. Grouped by similar angles.",
        options: [
          {
            name: "4A. Number of lines",
            min: 120,
            max: 200,
            start: 120
            ,step:40
          },
          {
            name: "4B. Number of clusters",
            min: 3,
            max: 9,
            start: 3
            ,step: 3
          },
          {
            name: "4C. Noise",
            min: 0,
            max: 0,
            start: 0
          },
          {
            name: "4D. Pixels per side",
            min: 5,
            max: 25,
            start: 15
            ,step: 10
          }
        ],
        generator: clusteredLineImages,
        previewOverride: lineClusterPreview
      },
      {
        name: "Sine frequency",
        description:
          "Sine Frequency: Vectors of a sine wave parameterized by frequency. Hue corresponds to frequency.",
        options: [
          {
            name: "5A. Number of vectors",
            min: 80,
            max: 160,
            start: 160
            ,step:40
          },
          {
            name: "5B. Vector size",
            min: 105,
            max: 305,
            start: 155
            ,step:50
          }
        ],
        generator: sineFrequency,
        previewOverride: sineFreqPreview
      },
      {
        name: "Sine phase",
        description:
          "Sine Phase: Vectors of a sine wave parameterized by phase. Hue corresponds to phase.",
        options: [
          {
            name: "6A. Number of vectors",
            min: 80,
            max: 140,
            start: 140
            ,step:20
          },
          {
            name: "6B. Vector size",
            min: 5,
            max: 305,
            start: 305
            ,step: 50
          }
        ],
        generator: sinePhase,
        previewOverride: sinePhasePreview
      }
    ];

    const demos = [
      {
        name: "Grid",
        description: "Grid: A square grid with equal spacing between points.",
        options: [
          {
            name: "7A. Points Per Side",
            min: 4,
            max: 30,
            start: 10
            ,step:2
          }
        ],
        generator: gridData
      },
      {
        name: "Two Clusters",
        description: "Two Clusters: Two clusters with equal numbers of points.",
        options: [
          {
            name: "8A. Points Per Cluster",
            min: 30,
            max: 110,
            start: 110
            ,step:20
          },
          {
            name: "8B. Dimensions",
            min: 5,
            max: 35,
            start: 35
            ,step:10
          }
        ],
        generator: twoClustersData
      },
      {
        name: "Three Clusters",
        description:
          "Three Clusters: Three clusters with equal numbers of points, but at " +
          "different distances from each other.",
        options: [
          {
            name: "9A. Points Per Cluster",
            min: 30,
            max: 110,
            start: 110
            ,step:20
          },
          {
            name: "9B. Dimensions",
            min: 5,
            max: 25,
            start: 25
            ,step: 10
          }
        ],
        generator: threeClustersData
      },
      {
        name: "Two Different-Sized Clusters",
        description:
          "Two Different-Sized Clusters: 2 clusters with equal numbers of points, but different " +
          "variances within the clusters.",
        options: [
          {
            name: "10A. Points Per Cluster",
            min: 30,
            max: 90,
            start: 90
            ,step:20
          },
          {
            name: "10B. Dimensions",
            min: 5,
            max: 45,
            start: 45
            ,step:10
          },
          {
            name: "10C. Scale",
            min: 10,
            max: 10,
            start: 10
          
          },
        ],
        generator: twoDifferentClustersData
      },
      {
        name: "Two Long Linear Clusters",
        description:
          "Two Long Linear Clusters: Two sets of points, arranged in parallel lines that " +
          "are close to each other. Note curvature of lines.",
        options: [
          {
            name: "11A. Points Per Cluster",
            min: 10,
            max: 100,
            start: 100
            ,step:10
          }
        ],
        generator: longClusterData
      },
      {
        name: "Cluster In Cluster",
        description: "Cluster in Cluster: A dense, tight cluster inside of a wide, sparse cluster.",
        options: [
          {
            name: "12A. Points Per Cluster",
            min: 30,
            max: 110,
            start: 30
            ,step:20
          },
          {
            name: "12B. Dimensions",
            min: 5,
            max: 35,
            start: 5
            ,step: 10
          }
        ],
        generator: subsetClustersData
      },
      {
        name: "Circle (Evenly Spaced)",
        description:
          "Circle (Evenly Spaced): Points evenly distributed in a circle. " +
          "Hue corresponds to angle in the circle.",
        options: [
          {
            name: "13A. Number Of Points",
            min: 52,
            max: 100,
            start: 100
            ,step: 4
          }
        ],
        generator: circleData
      },
      {
        name: "Circle (Randomly Spaced)",
        description:
          "Circle (Randomly Spaced):" +
          " Points randomly distributed in a circle. " +
          "Hue corresponds to angle in the circle.",
        options: [
          {
            name: "14A. Number Of Points",
            min: 52,
            max: 100,
            start: 100
            ,step:4
          }
        ],
        generator: randomCircleData
      },
      {
        name: "Gaussian Cloud",
        description:
          "Gaussian Cloud:" +
          " Points in a unit Gaussian distribution. " +
          "Data is entirely random, so any visible subclusters are " +
          "not statistically significant",
        options: [
          {
            name: "15A. Number Of Points",
            min: 100,
            max: 100,
            start: 100
            ,step:10
          },
          {
            name: "15B. Dimensions",
            min: 100,
            max: 100,
            start: 100
            ,step: 14
          }
        ],
        generator: gaussianData
      },
      {
        name: "Ellipsoidal Gaussian Cloud",
        description:
          "Ellipsoidal Gaussian Cloud:"+
          " Points in an ellipsoidal Gaussian distribution. " +
          " Dimension n has variance 1/n. Elongation is visible in plot.",
        options: [
          {
            name: "16A. Number Of Points",
            min: 40,
            max: 100,
            start: 100
            ,step:20
          },
          {
            name: "16B. Dimensions",
            min: 100,
            max: 100,
            start: 100
            ,step:14
          }
        ],
        generator: longGaussianData
      },
      {
        name: "Trefoil Knot",
        description:
        "Trefoil Knot: "+
        "Points arranged in 3D, following a trefoil knot. " +
          "Different runs may give different results.",
        options: [
          {
            name: "17A. Number Of Points",
            min: 30,
            max: 200,
            start: 170
            ,step:10
          }
        ],
        generator: trefoilData
      },
      {
        name: "Linked Rings",
        description: "Linked Rings: "+
        "Points arranged in 3D, on two linked circles. ",
        options: [
          {
            name: "18A. Number Of Points",
            min: 30,
            max: 200,
            start: 180
            ,step:10
          }
        ],
        generator: linkData
      },
      {
        name: "Unlinked Rings",
        description: "Unlinked Rings: "+
        "Points arranged in 3D, on two unlinked circles",
        options: [
          {
            name: "19A. Number Of Points",
            min: 30,
            max: 200,
            start: 200
            ,step:10
          }
        ],
        generator: unlinkData
      },
      {
        name: "Orthogonal Steps",
        description:
        "Orthogonal Steps: "+
        "Points related by mutually orthogonal steps. " +
          "Very similar to a random walk.",
        options: [
          {
            name: "20A. Number Of Points",
            min: 50,
            max: 850,
            start: 850
            ,step: 200
          }
        ],
        generator: orthoCurve
      },
      {
        name: "Random Walk",
        description: "Random (Gaussian) walk: " + "Smoother than you might think.",
        options: [
          {
            name: "21A. Number Of Points",
            min: 50,
            max: 850,
            start: 850,
            step: 200
          },
          {
            name: "21B.Dimension",
            min: 2,
            max: 902,
            start: 902,
            step:900
          }
        ],
        generator: randomWalk
      },
      {
        name: "Random Jump",
        description: "Random (Gaussian) Jump",
        options: [
          {
            name: "22A. Number Of Points",
            min: 50,
            max: 850,
            start: 850
            ,step:200
          },
          {
            name: "22B. Dimension",
            min: 3,
            max: 903,
            start: 3
            ,step: 903
          }
        ],
        generator: randomJump
      },
      {
        name: "Equally Spaced",
        description:
          "Equally Spaced points: Distances between all pairs of " +
          "points are the same in the original space.",
        options: [
          {
            name: "23A. Number Of Points",
            min: 20,
            max: 100,
            start: 100
            ,step:10
          }
        ],
        generator: simplexData
      },
      {
        name: "Uniform Distribution",
        description: "Uniform Distribution: Points uniformly distributed in a unit cube.",
        options: [
          {
            name: "24A. Number Of Points",
            min: 200,
            max: 500,
            start: 200
            ,step: 300,
          },
          {
            name: "24B. Dimensions",
            min: 2,
            max: 12,
            start: 7,
            step:12,
          }
        ],
        generator: cubeData
      }
    ];

    const allDemos = [...extendedDemos, ...demos];

    /* Copyright 2019 Google LLC All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
      ==============================================================================*/
      var globalParams;

      function getPoints(demo, params) {
        if (!params) {
          params = demo.options.map(option => option.start);
        }
        globalParams = params; // Save params to the global variable
        let result = demo.generator.apply(null, params);
        return result;
      }
      
    function getDemoPreviewOverride(demo, params) {
      if (!params) {
        params = demo.options.map(option => option.start);
      }

      if (demo.previewOverride) {
        return demo.previewOverride.apply(null, params);
      }
      return null;
    }

    // Helper function to draw a circle.
    // TODO: replace with canvas blitting for web rendering
    function circle(g, x, y, r) {
      g.beginPath();
      g.arc(x, y, r, 0, 2 * Math.PI);
      g.fill();
      g.stroke();
    }

    // Visualize the given points with the given message.
    // If "no3d" is set, ignore the 3D cue for size.
    function visualize(points, canvas, message, no3d) {
      var width = canvas.width;
      var height = canvas.height;
      var g = canvas.getContext("2d");
      g.fillStyle = "white";
      g.fillRect(0, 0, width, height);
      var xExtent = d3.extent(points, function(p) {
        return p.coords[0];
      });
      var yExtent = d3.extent(points, function(p) {
        return p.coords[1];
      });
      var zExtent = d3.extent(points, function(p) {
        return p.coords[2];
      });
      var zScale = d3
        .scaleLinear()
        .domain(zExtent)
        .range([2, 10]);

      var centerX = (xExtent[0] + xExtent[1]) / 2;
      var centerY = (yExtent[0] + yExtent[1]) / 2;
      var scale =
        Math.min(width, height) /
        Math.max(xExtent[1] - xExtent[0], yExtent[1] - yExtent[0]);
      scale *= 0.9; // Leave a little margin.
      g.strokeStyle = "rgba(255,255,255,.5)";
      var is3d = !no3d && points[0].coords.length > 2;
      var index = [];
      var n = points.length;
      if (is3d) {
        for (var i = 0; i < n; i++) {
          index[i] = i;
        }
        index.sort(function(a, b) {
          return d3.ascending(points[a].coords[2], points[b].coords[2]);
        });
      }

      for (var i = 0; i < n; i++) {
        var p = is3d ? points[index[i]] : points[i];
        g.fillStyle = p.color;
        var x = (p.coords[0] - centerX) * scale + width / 2;
        var y = -(p.coords[1] - centerY) * scale + height / 2;
        var r = is3d ? zScale(p.coords[2]) : 4;
        circle(g, x, y, r);

        if (!is3d) {
          p.px = x;
          p.py = y;
        }
      }

      if (message) {
        g.fillStyle = "#000";
        g.font = "24pt Lato";
        g.fillText(message, 8, 34);
      }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var utils = createCommonjsModule(function (module, exports) {
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    function tauRandInt(n, random) {
        return Math.floor(random() * n);
    }
    exports.tauRandInt = tauRandInt;
    function tauRand(random) {
        return random();
    }
    exports.tauRand = tauRand;
    function norm(vec) {
        var e_1, _a;
        var result = 0;
        try {
            for (var vec_1 = __values(vec), vec_1_1 = vec_1.next(); !vec_1_1.done; vec_1_1 = vec_1.next()) {
                var item = vec_1_1.value;
                result += Math.pow(item, 2);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (vec_1_1 && !vec_1_1.done && (_a = vec_1.return)) _a.call(vec_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Math.sqrt(result);
    }
    exports.norm = norm;
    function empty(n) {
        var output = [];
        for (var i = 0; i < n; i++) {
            output.push(undefined);
        }
        return output;
    }
    exports.empty = empty;
    function range(n) {
        return empty(n).map(function (_, i) { return i; });
    }
    exports.range = range;
    function filled(n, v) {
        return empty(n).map(function () { return v; });
    }
    exports.filled = filled;
    function zeros(n) {
        return filled(n, 0);
    }
    exports.zeros = zeros;
    function ones(n) {
        return filled(n, 1);
    }
    exports.ones = ones;
    function linear(a, b, len) {
        return empty(len).map(function (_, i) {
            return a + i * ((b - a) / (len - 1));
        });
    }
    exports.linear = linear;
    function sum(input) {
        return input.reduce(function (sum, val) { return sum + val; });
    }
    exports.sum = sum;
    function mean(input) {
        return sum(input) / input.length;
    }
    exports.mean = mean;
    function max(input) {
        var max = 0;
        for (var i = 0; i < input.length; i++) {
            max = input[i] > max ? input[i] : max;
        }
        return max;
    }
    exports.max = max;
    function max2d(input) {
        var max = 0;
        for (var i = 0; i < input.length; i++) {
            for (var j = 0; j < input[i].length; j++) {
                max = input[i][j] > max ? input[i][j] : max;
            }
        }
        return max;
    }
    exports.max2d = max2d;
    function rejectionSample(nSamples, poolSize, random) {
        var result = zeros(nSamples);
        for (var i = 0; i < nSamples; i++) {
            var rejectSample = true;
            while (rejectSample) {
                var j = tauRandInt(poolSize, random);
                var broken = false;
                for (var k = 0; k < i; k++) {
                    if (j === result[k]) {
                        broken = true;
                        break;
                    }
                }
                if (!broken) {
                    rejectSample = false;
                }
                result[i] = j;
            }
        }
        return result;
    }
    exports.rejectionSample = rejectionSample;
    function reshape2d(x, a, b) {
        var rows = [];
        var index = 0;
        if (x.length !== a * b) {
            throw new Error('Array dimensions must match input length.');
        }
        for (var i = 0; i < a; i++) {
            var col = [];
            for (var j = 0; j < b; j++) {
                col.push(x[index]);
                index += 1;
            }
            rows.push(col);
        }
        return rows;
    }
    exports.reshape2d = reshape2d;
    });

    unwrapExports(utils);
    var utils_1 = utils.tauRandInt;
    var utils_2 = utils.tauRand;
    var utils_3 = utils.norm;
    var utils_4 = utils.empty;
    var utils_5 = utils.range;
    var utils_6 = utils.filled;
    var utils_7 = utils.zeros;
    var utils_8 = utils.ones;
    var utils_9 = utils.linear;
    var utils_10 = utils.sum;
    var utils_11 = utils.mean;
    var utils_12 = utils.max;
    var utils_13 = utils.max2d;
    var utils_14 = utils.rejectionSample;
    var utils_15 = utils.reshape2d;

    var heap = createCommonjsModule(function (module, exports) {
    var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils$1 = __importStar(utils);
    function makeHeap(nPoints, size) {
        var makeArrays = function (fillValue) {
            return utils$1.empty(nPoints).map(function () {
                return utils$1.filled(size, fillValue);
            });
        };
        var heap = [];
        heap.push(makeArrays(-1));
        heap.push(makeArrays(Infinity));
        heap.push(makeArrays(0));
        return heap;
    }
    exports.makeHeap = makeHeap;
    function rejectionSample(nSamples, poolSize, random) {
        var result = utils$1.zeros(nSamples);
        for (var i = 0; i < nSamples; i++) {
            var rejectSample = true;
            var j = 0;
            while (rejectSample) {
                j = utils$1.tauRandInt(poolSize, random);
                var broken = false;
                for (var k = 0; k < i; k++) {
                    if (j === result[k]) {
                        broken = true;
                        break;
                    }
                }
                if (!broken)
                    rejectSample = false;
            }
            result[i] = j;
        }
        return result;
    }
    exports.rejectionSample = rejectionSample;
    function heapPush(heap, row, weight, index, flag) {
        row = Math.floor(row);
        var indices = heap[0][row];
        var weights = heap[1][row];
        var isNew = heap[2][row];
        if (weight >= weights[0]) {
            return 0;
        }
        for (var i = 0; i < indices.length; i++) {
            if (index === indices[i]) {
                return 0;
            }
        }
        return uncheckedHeapPush(heap, row, weight, index, flag);
    }
    exports.heapPush = heapPush;
    function uncheckedHeapPush(heap, row, weight, index, flag) {
        var indices = heap[0][row];
        var weights = heap[1][row];
        var isNew = heap[2][row];
        if (weight >= weights[0]) {
            return 0;
        }
        weights[0] = weight;
        indices[0] = index;
        isNew[0] = flag;
        var i = 0;
        var iSwap = 0;
        while (true) {
            var ic1 = 2 * i + 1;
            var ic2 = ic1 + 1;
            var heapShape2 = heap[0][0].length;
            if (ic1 >= heapShape2) {
                break;
            }
            else if (ic2 >= heapShape2) {
                if (weights[ic1] > weight) {
                    iSwap = ic1;
                }
                else {
                    break;
                }
            }
            else if (weights[ic1] >= weights[ic2]) {
                if (weight < weights[ic1]) {
                    iSwap = ic1;
                }
                else {
                    break;
                }
            }
            else {
                if (weight < weights[ic2]) {
                    iSwap = ic2;
                }
                else {
                    break;
                }
            }
            weights[i] = weights[iSwap];
            indices[i] = indices[iSwap];
            isNew[i] = isNew[iSwap];
            i = iSwap;
        }
        weights[i] = weight;
        indices[i] = index;
        isNew[i] = flag;
        return 1;
    }
    exports.uncheckedHeapPush = uncheckedHeapPush;
    function buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random) {
        var candidateNeighbors = makeHeap(nVertices, maxCandidates);
        for (var i = 0; i < nVertices; i++) {
            for (var j = 0; j < nNeighbors; j++) {
                if (currentGraph[0][i][j] < 0) {
                    continue;
                }
                var idx = currentGraph[0][i][j];
                var isn = currentGraph[2][i][j];
                var d = utils$1.tauRand(random);
                heapPush(candidateNeighbors, i, d, idx, isn);
                heapPush(candidateNeighbors, idx, d, i, isn);
                currentGraph[2][i][j] = 0;
            }
        }
        return candidateNeighbors;
    }
    exports.buildCandidates = buildCandidates;
    function deheapSort(heap) {
        var indices = heap[0];
        var weights = heap[1];
        for (var i = 0; i < indices.length; i++) {
            var indHeap = indices[i];
            var distHeap = weights[i];
            for (var j = 0; j < indHeap.length - 1; j++) {
                var indHeapIndex = indHeap.length - j - 1;
                var distHeapIndex = distHeap.length - j - 1;
                var temp1 = indHeap[0];
                indHeap[0] = indHeap[indHeapIndex];
                indHeap[indHeapIndex] = temp1;
                var temp2 = distHeap[0];
                distHeap[0] = distHeap[distHeapIndex];
                distHeap[distHeapIndex] = temp2;
                siftDown(distHeap, indHeap, distHeapIndex, 0);
            }
        }
        return { indices: indices, weights: weights };
    }
    exports.deheapSort = deheapSort;
    function siftDown(heap1, heap2, ceiling, elt) {
        while (elt * 2 + 1 < ceiling) {
            var leftChild = elt * 2 + 1;
            var rightChild = leftChild + 1;
            var swap = elt;
            if (heap1[swap] < heap1[leftChild]) {
                swap = leftChild;
            }
            if (rightChild < ceiling && heap1[swap] < heap1[rightChild]) {
                swap = rightChild;
            }
            if (swap === elt) {
                break;
            }
            else {
                var temp1 = heap1[elt];
                heap1[elt] = heap1[swap];
                heap1[swap] = temp1;
                var temp2 = heap2[elt];
                heap2[elt] = heap2[swap];
                heap2[swap] = temp2;
                elt = swap;
            }
        }
    }
    function smallestFlagged(heap, row) {
        var ind = heap[0][row];
        var dist = heap[1][row];
        var flag = heap[2][row];
        var minDist = Infinity;
        var resultIndex = -1;
        for (var i = 0; i > ind.length; i++) {
            if (flag[i] === 1 && dist[i] < minDist) {
                minDist = dist[i];
                resultIndex = i;
            }
        }
        if (resultIndex >= 0) {
            flag[resultIndex] = 0;
            return Math.floor(ind[resultIndex]);
        }
        else {
            return -1;
        }
    }
    exports.smallestFlagged = smallestFlagged;
    });

    unwrapExports(heap);
    var heap_1 = heap.makeHeap;
    var heap_2 = heap.rejectionSample;
    var heap_3 = heap.heapPush;
    var heap_4 = heap.uncheckedHeapPush;
    var heap_5 = heap.buildCandidates;
    var heap_6 = heap.deheapSort;
    var heap_7 = heap.smallestFlagged;

    var matrix = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spread = (commonjsGlobal && commonjsGlobal.__spread) || function () {
        for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
        return ar;
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a;
    var utils$1 = __importStar(utils);
    var SparseMatrix = (function () {
        function SparseMatrix(rows, cols, values, dims) {
            this.entries = new Map();
            this.nRows = 0;
            this.nCols = 0;
            this.rows = __spread(rows);
            this.cols = __spread(cols);
            this.values = __spread(values);
            for (var i = 0; i < values.length; i++) {
                var key = this.makeKey(this.rows[i], this.cols[i]);
                this.entries.set(key, i);
            }
            this.nRows = dims[0];
            this.nCols = dims[1];
        }
        SparseMatrix.prototype.makeKey = function (row, col) {
            return row + ":" + col;
        };
        SparseMatrix.prototype.checkDims = function (row, col) {
            var withinBounds = row < this.nRows && col < this.nCols;
            if (!withinBounds) {
                throw new Error('array index out of bounds');
            }
        };
        SparseMatrix.prototype.set = function (row, col, value) {
            this.checkDims(row, col);
            var key = this.makeKey(row, col);
            if (!this.entries.has(key)) {
                this.rows.push(row);
                this.cols.push(col);
                this.values.push(value);
                this.entries.set(key, this.values.length - 1);
            }
            else {
                var index = this.entries.get(key);
                this.values[index] = value;
            }
        };
        SparseMatrix.prototype.get = function (row, col, defaultValue) {
            if (defaultValue === void 0) { defaultValue = 0; }
            this.checkDims(row, col);
            var key = this.makeKey(row, col);
            if (this.entries.has(key)) {
                var index = this.entries.get(key);
                return this.values[index];
            }
            else {
                return defaultValue;
            }
        };
        SparseMatrix.prototype.getDims = function () {
            return [this.nRows, this.nCols];
        };
        SparseMatrix.prototype.getRows = function () {
            return __spread(this.rows);
        };
        SparseMatrix.prototype.getCols = function () {
            return __spread(this.cols);
        };
        SparseMatrix.prototype.getValues = function () {
            return __spread(this.values);
        };
        SparseMatrix.prototype.forEach = function (fn) {
            for (var i = 0; i < this.values.length; i++) {
                fn(this.values[i], this.rows[i], this.cols[i]);
            }
        };
        SparseMatrix.prototype.map = function (fn) {
            var vals = [];
            for (var i = 0; i < this.values.length; i++) {
                vals.push(fn(this.values[i], this.rows[i], this.cols[i]));
            }
            var dims = [this.nRows, this.nCols];
            return new SparseMatrix(this.rows, this.cols, vals, dims);
        };
        SparseMatrix.prototype.toArray = function () {
            var _this = this;
            var rows = utils$1.empty(this.nRows);
            var output = rows.map(function () {
                return utils$1.zeros(_this.nCols);
            });
            for (var i = 0; i < this.values.length; i++) {
                output[this.rows[i]][this.cols[i]] = this.values[i];
            }
            return output;
        };
        return SparseMatrix;
    }());
    exports.SparseMatrix = SparseMatrix;
    function transpose(matrix) {
        var cols = [];
        var rows = [];
        var vals = [];
        matrix.forEach(function (value, row, col) {
            cols.push(row);
            rows.push(col);
            vals.push(value);
        });
        var dims = [matrix.nCols, matrix.nRows];
        return new SparseMatrix(rows, cols, vals, dims);
    }
    exports.transpose = transpose;
    function identity(size) {
        var _a = __read(size, 1), rows = _a[0];
        var matrix = new SparseMatrix([], [], [], size);
        for (var i = 0; i < rows; i++) {
            matrix.set(i, i, 1);
        }
        return matrix;
    }
    exports.identity = identity;
    function pairwiseMultiply(a, b) {
        return elementWise(a, b, function (x, y) { return x * y; });
    }
    exports.pairwiseMultiply = pairwiseMultiply;
    function add(a, b) {
        return elementWise(a, b, function (x, y) { return x + y; });
    }
    exports.add = add;
    function subtract(a, b) {
        return elementWise(a, b, function (x, y) { return x - y; });
    }
    exports.subtract = subtract;
    function maximum(a, b) {
        return elementWise(a, b, function (x, y) { return (x > y ? x : y); });
    }
    exports.maximum = maximum;
    function multiplyScalar(a, scalar) {
        return a.map(function (value) {
            return value * scalar;
        });
    }
    exports.multiplyScalar = multiplyScalar;
    function eliminateZeros(m) {
        var zeroIndices = new Set();
        var values = m.getValues();
        var rows = m.getRows();
        var cols = m.getCols();
        for (var i = 0; i < values.length; i++) {
            if (values[i] === 0) {
                zeroIndices.add(i);
            }
        }
        var removeByZeroIndex = function (_, index) { return !zeroIndices.has(index); };
        var nextValues = values.filter(removeByZeroIndex);
        var nextRows = rows.filter(removeByZeroIndex);
        var nextCols = cols.filter(removeByZeroIndex);
        return new SparseMatrix(nextRows, nextCols, nextValues, m.getDims());
    }
    exports.eliminateZeros = eliminateZeros;
    function normalize(m, normType) {
        if (normType === void 0) { normType = "l2"; }
        var e_1, _a;
        var normFn = normFns[normType];
        var colsByRow = new Map();
        m.forEach(function (_, row, col) {
            var cols = colsByRow.get(row) || [];
            cols.push(col);
            colsByRow.set(row, cols);
        });
        var nextMatrix = new SparseMatrix([], [], [], m.getDims());
        var _loop_1 = function (row) {
            var cols = colsByRow.get(row).sort();
            var vals = cols.map(function (col) { return m.get(row, col); });
            var norm = normFn(vals);
            for (var i = 0; i < norm.length; i++) {
                nextMatrix.set(row, cols[i], norm[i]);
            }
        };
        try {
            for (var _b = __values(colsByRow.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                _loop_1(row);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return nextMatrix;
    }
    exports.normalize = normalize;
    var normFns = (_a = {},
        _a["max"] = function (xs) {
            var max = -Infinity;
            for (var i = 0; i < xs.length; i++) {
                max = xs[i] > max ? xs[i] : max;
            }
            return xs.map(function (x) { return x / max; });
        },
        _a["l1"] = function (xs) {
            var sum = 0;
            for (var i = 0; i < xs.length; i++) {
                sum += xs[i];
            }
            return xs.map(function (x) { return x / sum; });
        },
        _a["l2"] = function (xs) {
            var sum = 0;
            for (var i = 0; i < xs.length; i++) {
                sum += Math.pow(xs[i], 2);
            }
            return xs.map(function (x) { return Math.sqrt(Math.pow(x, 2) / sum); });
        },
        _a);
    function elementWise(a, b, op) {
        var visited = new Set();
        var rows = [];
        var cols = [];
        var vals = [];
        var operate = function (row, col) {
            rows.push(row);
            cols.push(col);
            var nextValue = op(a.get(row, col), b.get(row, col));
            vals.push(nextValue);
        };
        var valuesA = a.getValues();
        var rowsA = a.getRows();
        var colsA = a.getCols();
        for (var i = 0; i < valuesA.length; i++) {
            var row = rowsA[i];
            var col = colsA[i];
            var key = row + ":" + col;
            visited.add(key);
            operate(row, col);
        }
        var valuesB = b.getValues();
        var rowsB = b.getRows();
        var colsB = b.getCols();
        for (var i = 0; i < valuesB.length; i++) {
            var row = rowsB[i];
            var col = colsB[i];
            var key = row + ":" + col;
            if (visited.has(key))
                continue;
            operate(row, col);
        }
        var dims = [a.nRows, a.nCols];
        return new SparseMatrix(rows, cols, vals, dims);
    }
    function getCSR(x) {
        var entries = [];
        x.forEach(function (value, row, col) {
            entries.push({ value: value, row: row, col: col });
        });
        entries.sort(function (a, b) {
            if (a.row === b.row) {
                return a.col - b.col;
            }
            else {
                return a.row - b.col;
            }
        });
        var indices = [];
        var values = [];
        var indptr = [];
        var currentRow = -1;
        for (var i = 0; i < entries.length; i++) {
            var _a = entries[i], row = _a.row, col = _a.col, value = _a.value;
            if (row !== currentRow) {
                currentRow = row;
                indptr.push(i);
            }
            indices.push(col);
            values.push(value);
        }
        return { indices: indices, values: values, indptr: indptr };
    }
    exports.getCSR = getCSR;
    });

    unwrapExports(matrix);
    var matrix_1 = matrix.SparseMatrix;
    var matrix_2 = matrix.transpose;
    var matrix_3 = matrix.identity;
    var matrix_4 = matrix.pairwiseMultiply;
    var matrix_5 = matrix.add;
    var matrix_6 = matrix.subtract;
    var matrix_7 = matrix.maximum;
    var matrix_8 = matrix.multiplyScalar;
    var matrix_9 = matrix.eliminateZeros;
    var matrix_10 = matrix.normalize;
    var matrix_11 = matrix.getCSR;

    var tree = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spread = (commonjsGlobal && commonjsGlobal.__spread) || function () {
        for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
        return ar;
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils$1 = __importStar(utils);
    var FlatTree = (function () {
        function FlatTree(hyperplanes, offsets, children, indices) {
            this.hyperplanes = hyperplanes;
            this.offsets = offsets;
            this.children = children;
            this.indices = indices;
        }
        return FlatTree;
    }());
    exports.FlatTree = FlatTree;
    function makeForest(data, nNeighbors, nTrees, random) {
        var leafSize = Math.max(10, nNeighbors);
        var trees = utils$1
            .range(nTrees)
            .map(function (_, i) { return makeTree(data, leafSize, i, random); });
        var forest = trees.map(function (tree) { return flattenTree(tree, leafSize); });
        return forest;
    }
    exports.makeForest = makeForest;
    function makeTree(data, leafSize, n, random) {
        if (leafSize === void 0) { leafSize = 30; }
        var indices = utils$1.range(data.length);
        var tree = makeEuclideanTree(data, indices, leafSize, n, random);
        return tree;
    }
    function makeEuclideanTree(data, indices, leafSize, q, random) {
        if (leafSize === void 0) { leafSize = 30; }
        if (indices.length > leafSize) {
            var splitResults = euclideanRandomProjectionSplit(data, indices, random);
            var indicesLeft = splitResults.indicesLeft, indicesRight = splitResults.indicesRight, hyperplane = splitResults.hyperplane, offset = splitResults.offset;
            var leftChild = makeEuclideanTree(data, indicesLeft, leafSize, q + 1, random);
            var rightChild = makeEuclideanTree(data, indicesRight, leafSize, q + 1, random);
            var node = { leftChild: leftChild, rightChild: rightChild, isLeaf: false, hyperplane: hyperplane, offset: offset };
            return node;
        }
        else {
            var node = { indices: indices, isLeaf: true };
            return node;
        }
    }
    function euclideanRandomProjectionSplit(data, indices, random) {
        var dim = data[0].length;
        var leftIndex = utils$1.tauRandInt(indices.length, random);
        var rightIndex = utils$1.tauRandInt(indices.length, random);
        rightIndex += leftIndex === rightIndex ? 1 : 0;
        rightIndex = rightIndex % indices.length;
        var left = indices[leftIndex];
        var right = indices[rightIndex];
        var hyperplaneOffset = 0;
        var hyperplaneVector = utils$1.zeros(dim);
        for (var i = 0; i < hyperplaneVector.length; i++) {
            hyperplaneVector[i] = data[left][i] - data[right][i];
            hyperplaneOffset -=
                (hyperplaneVector[i] * (data[left][i] + data[right][i])) / 2.0;
        }
        var nLeft = 0;
        var nRight = 0;
        var side = utils$1.zeros(indices.length);
        for (var i = 0; i < indices.length; i++) {
            var margin = hyperplaneOffset;
            for (var d = 0; d < dim; d++) {
                margin += hyperplaneVector[d] * data[indices[i]][d];
            }
            if (margin === 0) {
                side[i] = utils$1.tauRandInt(2, random);
                if (side[i] === 0) {
                    nLeft += 1;
                }
                else {
                    nRight += 1;
                }
            }
            else if (margin > 0) {
                side[i] = 0;
                nLeft += 1;
            }
            else {
                side[i] = 1;
                nRight += 1;
            }
        }
        var indicesLeft = utils$1.zeros(nLeft);
        var indicesRight = utils$1.zeros(nRight);
        nLeft = 0;
        nRight = 0;
        for (var i in utils$1.range(side.length)) {
            if (side[i] === 0) {
                indicesLeft[nLeft] = indices[i];
                nLeft += 1;
            }
            else {
                indicesRight[nRight] = indices[i];
                nRight += 1;
            }
        }
        return {
            indicesLeft: indicesLeft,
            indicesRight: indicesRight,
            hyperplane: hyperplaneVector,
            offset: hyperplaneOffset,
        };
    }
    function flattenTree(tree, leafSize) {
        var nNodes = numNodes(tree);
        var nLeaves = numLeaves(tree);
        var hyperplanes = utils$1
            .range(nNodes)
            .map(function () { return utils$1.zeros(tree.hyperplane.length); });
        var offsets = utils$1.zeros(nNodes);
        var children = utils$1.range(nNodes).map(function () { return [-1, -1]; });
        var indices = utils$1
            .range(nLeaves)
            .map(function () { return utils$1.range(leafSize).map(function () { return -1; }); });
        recursiveFlatten(tree, hyperplanes, offsets, children, indices, 0, 0);
        return new FlatTree(hyperplanes, offsets, children, indices);
    }
    function recursiveFlatten(tree, hyperplanes, offsets, children, indices, nodeNum, leafNum) {
        var _a;
        if (tree.isLeaf) {
            children[nodeNum][0] = -leafNum;
            (_a = indices[leafNum]).splice.apply(_a, __spread([0, tree.indices.length], tree.indices));
            leafNum += 1;
            return { nodeNum: nodeNum, leafNum: leafNum };
        }
        else {
            hyperplanes[nodeNum] = tree.hyperplane;
            offsets[nodeNum] = tree.offset;
            children[nodeNum][0] = nodeNum + 1;
            var oldNodeNum = nodeNum;
            var res = recursiveFlatten(tree.leftChild, hyperplanes, offsets, children, indices, nodeNum + 1, leafNum);
            nodeNum = res.nodeNum;
            leafNum = res.leafNum;
            children[oldNodeNum][1] = nodeNum + 1;
            res = recursiveFlatten(tree.rightChild, hyperplanes, offsets, children, indices, nodeNum + 1, leafNum);
            return { nodeNum: res.nodeNum, leafNum: res.leafNum };
        }
    }
    function numNodes(tree) {
        if (tree.isLeaf) {
            return 1;
        }
        else {
            return 1 + numNodes(tree.leftChild) + numNodes(tree.rightChild);
        }
    }
    function numLeaves(tree) {
        if (tree.isLeaf) {
            return 1;
        }
        else {
            return numLeaves(tree.leftChild) + numLeaves(tree.rightChild);
        }
    }
    function makeLeafArray(rpForest) {
        var e_1, _a;
        if (rpForest.length > 0) {
            var output = [];
            try {
                for (var rpForest_1 = __values(rpForest), rpForest_1_1 = rpForest_1.next(); !rpForest_1_1.done; rpForest_1_1 = rpForest_1.next()) {
                    var tree = rpForest_1_1.value;
                    output.push.apply(output, __spread(tree.indices));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rpForest_1_1 && !rpForest_1_1.done && (_a = rpForest_1.return)) _a.call(rpForest_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return output;
        }
        else {
            return [[-1]];
        }
    }
    exports.makeLeafArray = makeLeafArray;
    function selectSide(hyperplane, offset, point, random) {
        var margin = offset;
        for (var d = 0; d < point.length; d++) {
            margin += hyperplane[d] * point[d];
        }
        if (margin === 0) {
            var side = utils$1.tauRandInt(2, random);
            return side;
        }
        else if (margin > 0) {
            return 0;
        }
        else {
            return 1;
        }
    }
    function searchFlatTree(point, tree, random) {
        var node = 0;
        while (tree.children[node][0] > 0) {
            var side = selectSide(tree.hyperplanes[node], tree.offsets[node], point, random);
            if (side === 0) {
                node = tree.children[node][0];
            }
            else {
                node = tree.children[node][1];
            }
        }
        var index = -1 * tree.children[node][0];
        return tree.indices[index];
    }
    exports.searchFlatTree = searchFlatTree;
    });

    unwrapExports(tree);
    var tree_1 = tree.FlatTree;
    var tree_2 = tree.makeForest;
    var tree_3 = tree.makeLeafArray;
    var tree_4 = tree.searchFlatTree;

    var nn_descent = createCommonjsModule(function (module, exports) {
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var heap$1 = __importStar(heap);
    var matrix$1 = __importStar(matrix);
    var tree$1 = __importStar(tree);
    var utils$1 = __importStar(utils);
    function makeNNDescent(distanceFn, random) {
        return function nNDescent(data, leafArray, nNeighbors, nIters, maxCandidates, delta, rho, rpTreeInit) {
            if (nIters === void 0) { nIters = 10; }
            if (maxCandidates === void 0) { maxCandidates = 50; }
            if (delta === void 0) { delta = 0.001; }
            if (rho === void 0) { rho = 0.5; }
            if (rpTreeInit === void 0) { rpTreeInit = true; }
            var nVertices = data.length;
            var currentGraph = heap$1.makeHeap(data.length, nNeighbors);
            for (var i = 0; i < data.length; i++) {
                var indices = heap$1.rejectionSample(nNeighbors, data.length, random);
                for (var j = 0; j < indices.length; j++) {
                    var d = distanceFn(data[i], data[indices[j]]);
                    heap$1.heapPush(currentGraph, i, d, indices[j], 1);
                    heap$1.heapPush(currentGraph, indices[j], d, i, 1);
                }
            }
            if (rpTreeInit) {
                for (var n = 0; n < leafArray.length; n++) {
                    for (var i = 0; i < leafArray[n].length; i++) {
                        if (leafArray[n][i] < 0) {
                            break;
                        }
                        for (var j = i + 1; j < leafArray[n].length; j++) {
                            if (leafArray[n][j] < 0) {
                                break;
                            }
                            var d = distanceFn(data[leafArray[n][i]], data[leafArray[n][j]]);
                            heap$1.heapPush(currentGraph, leafArray[n][i], d, leafArray[n][j], 1);
                            heap$1.heapPush(currentGraph, leafArray[n][j], d, leafArray[n][i], 1);
                        }
                    }
                }
            }
            for (var n = 0; n < nIters; n++) {
                var candidateNeighbors = heap$1.buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random);
                var c = 0;
                for (var i = 0; i < nVertices; i++) {
                    for (var j = 0; j < maxCandidates; j++) {
                        var p = Math.floor(candidateNeighbors[0][i][j]);
                        if (p < 0 || utils$1.tauRand(random) < rho) {
                            continue;
                        }
                        for (var k = 0; k < maxCandidates; k++) {
                            var q = Math.floor(candidateNeighbors[0][i][k]);
                            var cj = candidateNeighbors[2][i][j];
                            var ck = candidateNeighbors[2][i][k];
                            if (q < 0 || (!cj && !ck)) {
                                continue;
                            }
                            var d = distanceFn(data[p], data[q]);
                            c += heap$1.heapPush(currentGraph, p, d, q, 1);
                            c += heap$1.heapPush(currentGraph, q, d, p, 1);
                        }
                    }
                }
                if (c <= delta * nNeighbors * data.length) {
                    break;
                }
            }
            var sorted = heap$1.deheapSort(currentGraph);
            return sorted;
        };
    }
    exports.makeNNDescent = makeNNDescent;
    function makeInitializations(distanceFn) {
        function initFromRandom(nNeighbors, data, queryPoints, _heap, random) {
            for (var i = 0; i < queryPoints.length; i++) {
                var indices = utils$1.rejectionSample(nNeighbors, data.length, random);
                for (var j = 0; j < indices.length; j++) {
                    if (indices[j] < 0) {
                        continue;
                    }
                    var d = distanceFn(data[indices[j]], queryPoints[i]);
                    heap$1.heapPush(_heap, i, d, indices[j], 1);
                }
            }
        }
        function initFromTree(_tree, data, queryPoints, _heap, random) {
            for (var i = 0; i < queryPoints.length; i++) {
                var indices = tree$1.searchFlatTree(queryPoints[i], _tree, random);
                for (var j = 0; j < indices.length; j++) {
                    if (indices[j] < 0) {
                        return;
                    }
                    var d = distanceFn(data[indices[j]], queryPoints[i]);
                    heap$1.heapPush(_heap, i, d, indices[j], 1);
                }
            }
            return;
        }
        return { initFromRandom: initFromRandom, initFromTree: initFromTree };
    }
    exports.makeInitializations = makeInitializations;
    function makeInitializedNNSearch(distanceFn) {
        return function nnSearchFn(data, graph, initialization, queryPoints) {
            var e_1, _a;
            var _b = matrix$1.getCSR(graph), indices = _b.indices, indptr = _b.indptr;
            for (var i = 0; i < queryPoints.length; i++) {
                var tried = new Set(initialization[0][i]);
                while (true) {
                    var vertex = heap$1.smallestFlagged(initialization, i);
                    if (vertex === -1) {
                        break;
                    }
                    var candidates = indices.slice(indptr[vertex], indptr[vertex + 1]);
                    try {
                        for (var candidates_1 = __values(candidates), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                            var candidate = candidates_1_1.value;
                            if (candidate === vertex ||
                                candidate === -1 ||
                                tried.has(candidate)) {
                                continue;
                            }
                            var d = distanceFn(data[candidate], queryPoints[i]);
                            heap$1.uncheckedHeapPush(initialization, i, d, candidate, 1);
                            tried.add(candidate);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
            return initialization;
        };
    }
    exports.makeInitializedNNSearch = makeInitializedNNSearch;
    function initializeSearch(forest, data, queryPoints, nNeighbors, initFromRandom, initFromTree, random) {
        var e_2, _a;
        var results = heap$1.makeHeap(queryPoints.length, nNeighbors);
        initFromRandom(nNeighbors, data, queryPoints, results, random);
        if (forest) {
            try {
                for (var forest_1 = __values(forest), forest_1_1 = forest_1.next(); !forest_1_1.done; forest_1_1 = forest_1.next()) {
                    var tree_1 = forest_1_1.value;
                    initFromTree(tree_1, data, queryPoints, results, random);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (forest_1_1 && !forest_1_1.done && (_a = forest_1.return)) _a.call(forest_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return results;
    }
    exports.initializeSearch = initializeSearch;
    });

    unwrapExports(nn_descent);
    var nn_descent_1 = nn_descent.makeNNDescent;
    var nn_descent_2 = nn_descent.makeInitializations;
    var nn_descent_3 = nn_descent.makeInitializedNNSearch;
    var nn_descent_4 = nn_descent.initializeSearch;

    /**
     * Calculate current error
     * @ignore
     * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
     * @param {Array<number>} parameters - Array of current parameter values
     * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
     * @return {number}
     */
    function errorCalculation(
      data,
      parameters,
      parameterizedFunction
    ) {
      var error = 0;
      const func = parameterizedFunction(parameters);

      for (var i = 0; i < data.x.length; i++) {
        error += Math.abs(data.y[i] - func(data.x[i]));
      }

      return error;
    }

    const toString = Object.prototype.toString;

    function isAnyArray(object) {
      return toString.call(object).endsWith('Array]');
    }

    var src = isAnyArray;

    /**
     * Computes the maximum of the given values
     * @param {Array<number>} input
     * @return {number}
     */

    function max(input) {
      if (!src(input)) {
        throw new TypeError('input must be an array');
      }

      if (input.length === 0) {
        throw new TypeError('input must not be empty');
      }

      var maxValue = input[0];

      for (var i = 1; i < input.length; i++) {
        if (input[i] > maxValue) maxValue = input[i];
      }

      return maxValue;
    }

    /**
     * Computes the minimum of the given values
     * @param {Array<number>} input
     * @return {number}
     */

    function min(input) {
      if (!src(input)) {
        throw new TypeError('input must be an array');
      }

      if (input.length === 0) {
        throw new TypeError('input must not be empty');
      }

      var minValue = input[0];

      for (var i = 1; i < input.length; i++) {
        if (input[i] < minValue) minValue = input[i];
      }

      return minValue;
    }

    function rescale(input) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!src(input)) {
        throw new TypeError('input must be an array');
      } else if (input.length === 0) {
        throw new TypeError('input must not be empty');
      }

      var output;

      if (options.output !== undefined) {
        if (!src(options.output)) {
          throw new TypeError('output option must be an array if specified');
        }

        output = options.output;
      } else {
        output = new Array(input.length);
      }

      var currentMin = min(input);
      var currentMax = max(input);

      if (currentMin === currentMax) {
        throw new RangeError('minimum and maximum input values are equal. Cannot rescale a constant array');
      }

      var _options$min = options.min,
          minValue = _options$min === void 0 ? options.autoMinMax ? currentMin : 0 : _options$min,
          _options$max = options.max,
          maxValue = _options$max === void 0 ? options.autoMinMax ? currentMax : 1 : _options$max;

      if (minValue >= maxValue) {
        throw new RangeError('min option must be smaller than max option');
      }

      var factor = (maxValue - minValue) / (currentMax - currentMin);

      for (var i = 0; i < input.length; i++) {
        output[i] = (input[i] - currentMin) * factor + minValue;
      }

      return output;
    }

    /**
     * @class LuDecomposition
     * @link https://github.com/lutzroeder/Mapack/blob/master/Source/LuDecomposition.cs
     * @param {Matrix} matrix
     */
    class LuDecomposition {
      constructor(matrix) {
        matrix = WrapperMatrix2D.checkMatrix(matrix);

        var lu = matrix.clone();
        var rows = lu.rows;
        var columns = lu.columns;
        var pivotVector = new Array(rows);
        var pivotSign = 1;
        var i, j, k, p, s, t, v;
        var LUcolj, kmax;

        for (i = 0; i < rows; i++) {
          pivotVector[i] = i;
        }

        LUcolj = new Array(rows);

        for (j = 0; j < columns; j++) {
          for (i = 0; i < rows; i++) {
            LUcolj[i] = lu.get(i, j);
          }

          for (i = 0; i < rows; i++) {
            kmax = Math.min(i, j);
            s = 0;
            for (k = 0; k < kmax; k++) {
              s += lu.get(i, k) * LUcolj[k];
            }
            LUcolj[i] -= s;
            lu.set(i, j, LUcolj[i]);
          }

          p = j;
          for (i = j + 1; i < rows; i++) {
            if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
              p = i;
            }
          }

          if (p !== j) {
            for (k = 0; k < columns; k++) {
              t = lu.get(p, k);
              lu.set(p, k, lu.get(j, k));
              lu.set(j, k, t);
            }

            v = pivotVector[p];
            pivotVector[p] = pivotVector[j];
            pivotVector[j] = v;

            pivotSign = -pivotSign;
          }

          if (j < rows && lu.get(j, j) !== 0) {
            for (i = j + 1; i < rows; i++) {
              lu.set(i, j, lu.get(i, j) / lu.get(j, j));
            }
          }
        }

        this.LU = lu;
        this.pivotVector = pivotVector;
        this.pivotSign = pivotSign;
      }

      /**
       *
       * @return {boolean}
       */
      isSingular() {
        var data = this.LU;
        var col = data.columns;
        for (var j = 0; j < col; j++) {
          if (data[j][j] === 0) {
            return true;
          }
        }
        return false;
      }

      /**
       *
       * @param {Matrix} value
       * @return {Matrix}
       */
      solve(value) {
        value = Matrix.checkMatrix(value);

        var lu = this.LU;
        var rows = lu.rows;

        if (rows !== value.rows) {
          throw new Error('Invalid matrix dimensions');
        }
        if (this.isSingular()) {
          throw new Error('LU matrix is singular');
        }

        var count = value.columns;
        var X = value.subMatrixRow(this.pivotVector, 0, count - 1);
        var columns = lu.columns;
        var i, j, k;

        for (k = 0; k < columns; k++) {
          for (i = k + 1; i < columns; i++) {
            for (j = 0; j < count; j++) {
              X[i][j] -= X[k][j] * lu[i][k];
            }
          }
        }
        for (k = columns - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            X[k][j] /= lu[k][k];
          }
          for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) {
              X[i][j] -= X[k][j] * lu[i][k];
            }
          }
        }
        return X;
      }

      /**
       *
       * @return {number}
       */
      get determinant() {
        var data = this.LU;
        if (!data.isSquare()) {
          throw new Error('Matrix must be square');
        }
        var determinant = this.pivotSign;
        var col = data.columns;
        for (var j = 0; j < col; j++) {
          determinant *= data[j][j];
        }
        return determinant;
      }

      /**
       *
       * @return {Matrix}
       */
      get lowerTriangularMatrix() {
        var data = this.LU;
        var rows = data.rows;
        var columns = data.columns;
        var X = new Matrix(rows, columns);
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            if (i > j) {
              X[i][j] = data[i][j];
            } else if (i === j) {
              X[i][j] = 1;
            } else {
              X[i][j] = 0;
            }
          }
        }
        return X;
      }

      /**
       *
       * @return {Matrix}
       */
      get upperTriangularMatrix() {
        var data = this.LU;
        var rows = data.rows;
        var columns = data.columns;
        var X = new Matrix(rows, columns);
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            if (i <= j) {
              X[i][j] = data[i][j];
            } else {
              X[i][j] = 0;
            }
          }
        }
        return X;
      }

      /**
       *
       * @return {Array<number>}
       */
      get pivotPermutationVector() {
        return this.pivotVector.slice();
      }
    }

    function hypotenuse(a, b) {
      var r = 0;
      if (Math.abs(a) > Math.abs(b)) {
        r = b / a;
        return Math.abs(a) * Math.sqrt(1 + r * r);
      }
      if (b !== 0) {
        r = a / b;
        return Math.abs(b) * Math.sqrt(1 + r * r);
      }
      return 0;
    }

    function getFilled2DArray(rows, columns, value) {
      var array = new Array(rows);
      for (var i = 0; i < rows; i++) {
        array[i] = new Array(columns);
        for (var j = 0; j < columns; j++) {
          array[i][j] = value;
        }
      }
      return array;
    }

    /**
     * @class SingularValueDecomposition
     * @see https://github.com/accord-net/framework/blob/development/Sources/Accord.Math/Decompositions/SingularValueDecomposition.cs
     * @param {Matrix} value
     * @param {object} [options]
     * @param {boolean} [options.computeLeftSingularVectors=true]
     * @param {boolean} [options.computeRightSingularVectors=true]
     * @param {boolean} [options.autoTranspose=false]
     */
    class SingularValueDecomposition {
      constructor(value, options = {}) {
        value = WrapperMatrix2D.checkMatrix(value);

        var m = value.rows;
        var n = value.columns;

        const {
          computeLeftSingularVectors = true,
          computeRightSingularVectors = true,
          autoTranspose = false
        } = options;

        var wantu = Boolean(computeLeftSingularVectors);
        var wantv = Boolean(computeRightSingularVectors);

        var swapped = false;
        var a;
        if (m < n) {
          if (!autoTranspose) {
            a = value.clone();
            // eslint-disable-next-line no-console
            console.warn(
              'Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose'
            );
          } else {
            a = value.transpose();
            m = a.rows;
            n = a.columns;
            swapped = true;
            var aux = wantu;
            wantu = wantv;
            wantv = aux;
          }
        } else {
          a = value.clone();
        }

        var nu = Math.min(m, n);
        var ni = Math.min(m + 1, n);
        var s = new Array(ni);
        var U = getFilled2DArray(m, nu, 0);
        var V = getFilled2DArray(n, n, 0);

        var e = new Array(n);
        var work = new Array(m);

        var si = new Array(ni);
        for (let i = 0; i < ni; i++) si[i] = i;

        var nct = Math.min(m - 1, n);
        var nrt = Math.max(0, Math.min(n - 2, m));
        var mrc = Math.max(nct, nrt);

        for (let k = 0; k < mrc; k++) {
          if (k < nct) {
            s[k] = 0;
            for (let i = k; i < m; i++) {
              s[k] = hypotenuse(s[k], a[i][k]);
            }
            if (s[k] !== 0) {
              if (a[k][k] < 0) {
                s[k] = -s[k];
              }
              for (let i = k; i < m; i++) {
                a[i][k] /= s[k];
              }
              a[k][k] += 1;
            }
            s[k] = -s[k];
          }

          for (let j = k + 1; j < n; j++) {
            if (k < nct && s[k] !== 0) {
              let t = 0;
              for (let i = k; i < m; i++) {
                t += a[i][k] * a[i][j];
              }
              t = -t / a[k][k];
              for (let i = k; i < m; i++) {
                a[i][j] += t * a[i][k];
              }
            }
            e[j] = a[k][j];
          }

          if (wantu && k < nct) {
            for (let i = k; i < m; i++) {
              U[i][k] = a[i][k];
            }
          }

          if (k < nrt) {
            e[k] = 0;
            for (let i = k + 1; i < n; i++) {
              e[k] = hypotenuse(e[k], e[i]);
            }
            if (e[k] !== 0) {
              if (e[k + 1] < 0) {
                e[k] = 0 - e[k];
              }
              for (let i = k + 1; i < n; i++) {
                e[i] /= e[k];
              }
              e[k + 1] += 1;
            }
            e[k] = -e[k];
            if (k + 1 < m && e[k] !== 0) {
              for (let i = k + 1; i < m; i++) {
                work[i] = 0;
              }
              for (let i = k + 1; i < m; i++) {
                for (let j = k + 1; j < n; j++) {
                  work[i] += e[j] * a[i][j];
                }
              }
              for (let j = k + 1; j < n; j++) {
                let t = -e[j] / e[k + 1];
                for (let i = k + 1; i < m; i++) {
                  a[i][j] += t * work[i];
                }
              }
            }
            if (wantv) {
              for (let i = k + 1; i < n; i++) {
                V[i][k] = e[i];
              }
            }
          }
        }

        let p = Math.min(n, m + 1);
        if (nct < n) {
          s[nct] = a[nct][nct];
        }
        if (m < p) {
          s[p - 1] = 0;
        }
        if (nrt + 1 < p) {
          e[nrt] = a[nrt][p - 1];
        }
        e[p - 1] = 0;

        if (wantu) {
          for (let j = nct; j < nu; j++) {
            for (let i = 0; i < m; i++) {
              U[i][j] = 0;
            }
            U[j][j] = 1;
          }
          for (let k = nct - 1; k >= 0; k--) {
            if (s[k] !== 0) {
              for (let j = k + 1; j < nu; j++) {
                let t = 0;
                for (let i = k; i < m; i++) {
                  t += U[i][k] * U[i][j];
                }
                t = -t / U[k][k];
                for (let i = k; i < m; i++) {
                  U[i][j] += t * U[i][k];
                }
              }
              for (let i = k; i < m; i++) {
                U[i][k] = -U[i][k];
              }
              U[k][k] = 1 + U[k][k];
              for (let i = 0; i < k - 1; i++) {
                U[i][k] = 0;
              }
            } else {
              for (let i = 0; i < m; i++) {
                U[i][k] = 0;
              }
              U[k][k] = 1;
            }
          }
        }

        if (wantv) {
          for (let k = n - 1; k >= 0; k--) {
            if (k < nrt && e[k] !== 0) {
              for (let j = k + 1; j < n; j++) {
                let t = 0;
                for (let i = k + 1; i < n; i++) {
                  t += V[i][k] * V[i][j];
                }
                t = -t / V[k + 1][k];
                for (let i = k + 1; i < n; i++) {
                  V[i][j] += t * V[i][k];
                }
              }
            }
            for (let i = 0; i < n; i++) {
              V[i][k] = 0;
            }
            V[k][k] = 1;
          }
        }

        var pp = p - 1;
        var eps = Number.EPSILON;
        while (p > 0) {
          let k, kase;
          for (k = p - 2; k >= -1; k--) {
            if (k === -1) {
              break;
            }
            const alpha =
              Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
            if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
              e[k] = 0;
              break;
            }
          }
          if (k === p - 2) {
            kase = 4;
          } else {
            let ks;
            for (ks = p - 1; ks >= k; ks--) {
              if (ks === k) {
                break;
              }
              let t =
                (ks !== p ? Math.abs(e[ks]) : 0) +
                (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
              if (Math.abs(s[ks]) <= eps * t) {
                s[ks] = 0;
                break;
              }
            }
            if (ks === k) {
              kase = 3;
            } else if (ks === p - 1) {
              kase = 1;
            } else {
              kase = 2;
              k = ks;
            }
          }

          k++;

          switch (kase) {
            case 1: {
              let f = e[p - 2];
              e[p - 2] = 0;
              for (let j = p - 2; j >= k; j--) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                if (j !== k) {
                  f = -sn * e[j - 1];
                  e[j - 1] = cs * e[j - 1];
                }
                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V[i][j] + sn * V[i][p - 1];
                    V[i][p - 1] = -sn * V[i][j] + cs * V[i][p - 1];
                    V[i][j] = t;
                  }
                }
              }
              break;
            }
            case 2: {
              let f = e[k - 1];
              e[k - 1] = 0;
              for (let j = k; j < p; j++) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                f = -sn * e[j];
                e[j] = cs * e[j];
                if (wantu) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U[i][j] + sn * U[i][k - 1];
                    U[i][k - 1] = -sn * U[i][j] + cs * U[i][k - 1];
                    U[i][j] = t;
                  }
                }
              }
              break;
            }
            case 3: {
              const scale = Math.max(
                Math.abs(s[p - 1]),
                Math.abs(s[p - 2]),
                Math.abs(e[p - 2]),
                Math.abs(s[k]),
                Math.abs(e[k])
              );
              const sp = s[p - 1] / scale;
              const spm1 = s[p - 2] / scale;
              const epm1 = e[p - 2] / scale;
              const sk = s[k] / scale;
              const ek = e[k] / scale;
              const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
              const c = sp * epm1 * (sp * epm1);
              let shift = 0;
              if (b !== 0 || c !== 0) {
                if (b < 0) {
                  shift = 0 - Math.sqrt(b * b + c);
                } else {
                  shift = Math.sqrt(b * b + c);
                }
                shift = c / (b + shift);
              }
              let f = (sk + sp) * (sk - sp) + shift;
              let g = sk * ek;
              for (let j = k; j < p - 1; j++) {
                let t = hypotenuse(f, g);
                if (t === 0) t = Number.MIN_VALUE;
                let cs = f / t;
                let sn = g / t;
                if (j !== k) {
                  e[j - 1] = t;
                }
                f = cs * s[j] + sn * e[j];
                e[j] = cs * e[j] - sn * s[j];
                g = sn * s[j + 1];
                s[j + 1] = cs * s[j + 1];
                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V[i][j] + sn * V[i][j + 1];
                    V[i][j + 1] = -sn * V[i][j] + cs * V[i][j + 1];
                    V[i][j] = t;
                  }
                }
                t = hypotenuse(f, g);
                if (t === 0) t = Number.MIN_VALUE;
                cs = f / t;
                sn = g / t;
                s[j] = t;
                f = cs * e[j] + sn * s[j + 1];
                s[j + 1] = -sn * e[j] + cs * s[j + 1];
                g = sn * e[j + 1];
                e[j + 1] = cs * e[j + 1];
                if (wantu && j < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U[i][j] + sn * U[i][j + 1];
                    U[i][j + 1] = -sn * U[i][j] + cs * U[i][j + 1];
                    U[i][j] = t;
                  }
                }
              }
              e[p - 2] = f;
              break;
            }
            case 4: {
              if (s[k] <= 0) {
                s[k] = s[k] < 0 ? -s[k] : 0;
                if (wantv) {
                  for (let i = 0; i <= pp; i++) {
                    V[i][k] = -V[i][k];
                  }
                }
              }
              while (k < pp) {
                if (s[k] >= s[k + 1]) {
                  break;
                }
                let t = s[k];
                s[k] = s[k + 1];
                s[k + 1] = t;
                if (wantv && k < n - 1) {
                  for (let i = 0; i < n; i++) {
                    t = V[i][k + 1];
                    V[i][k + 1] = V[i][k];
                    V[i][k] = t;
                  }
                }
                if (wantu && k < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = U[i][k + 1];
                    U[i][k + 1] = U[i][k];
                    U[i][k] = t;
                  }
                }
                k++;
              }
              p--;
              break;
            }
            // no default
          }
        }

        if (swapped) {
          var tmp = V;
          V = U;
          U = tmp;
        }

        this.m = m;
        this.n = n;
        this.s = s;
        this.U = U;
        this.V = V;
      }

      /**
       * Solve a problem of least square (Ax=b) by using the SVD. Useful when A is singular. When A is not singular, it would be better to use qr.solve(value).
       * Example : We search to approximate x, with A matrix shape m*n, x vector size n, b vector size m (m > n). We will use :
       * var svd = SingularValueDecomposition(A);
       * var x = svd.solve(b);
       * @param {Matrix} value - Matrix 1D which is the vector b (in the equation Ax = b)
       * @return {Matrix} - The vector x
       */
      solve(value) {
        var Y = value;
        var e = this.threshold;
        var scols = this.s.length;
        var Ls = Matrix.zeros(scols, scols);

        for (let i = 0; i < scols; i++) {
          if (Math.abs(this.s[i]) <= e) {
            Ls[i][i] = 0;
          } else {
            Ls[i][i] = 1 / this.s[i];
          }
        }

        var U = this.U;
        var V = this.rightSingularVectors;

        var VL = V.mmul(Ls);
        var vrows = V.rows;
        var urows = U.length;
        var VLU = Matrix.zeros(vrows, urows);

        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < urows; j++) {
            let sum = 0;
            for (let k = 0; k < scols; k++) {
              sum += VL[i][k] * U[j][k];
            }
            VLU[i][j] = sum;
          }
        }

        return VLU.mmul(Y);
      }

      /**
       *
       * @param {Array<number>} value
       * @return {Matrix}
       */
      solveForDiagonal(value) {
        return this.solve(Matrix.diag(value));
      }

      /**
       * Get the inverse of the matrix. We compute the inverse of a matrix using SVD when this matrix is singular or ill-conditioned. Example :
       * var svd = SingularValueDecomposition(A);
       * var inverseA = svd.inverse();
       * @return {Matrix} - The approximation of the inverse of the matrix
       */
      inverse() {
        var V = this.V;
        var e = this.threshold;
        var vrows = V.length;
        var vcols = V[0].length;
        var X = new Matrix(vrows, this.s.length);

        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < vcols; j++) {
            if (Math.abs(this.s[j]) > e) {
              X[i][j] = V[i][j] / this.s[j];
            } else {
              X[i][j] = 0;
            }
          }
        }

        var U = this.U;

        var urows = U.length;
        var ucols = U[0].length;
        var Y = new Matrix(vrows, urows);

        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < urows; j++) {
            let sum = 0;
            for (let k = 0; k < ucols; k++) {
              sum += X[i][k] * U[j][k];
            }
            Y[i][j] = sum;
          }
        }

        return Y;
      }

      /**
       *
       * @return {number}
       */
      get condition() {
        return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
      }

      /**
       *
       * @return {number}
       */
      get norm2() {
        return this.s[0];
      }

      /**
       *
       * @return {number}
       */
      get rank() {
        var tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
        var r = 0;
        var s = this.s;
        for (var i = 0, ii = s.length; i < ii; i++) {
          if (s[i] > tol) {
            r++;
          }
        }
        return r;
      }

      /**
       *
       * @return {Array<number>}
       */
      get diagonal() {
        return this.s;
      }

      /**
       *
       * @return {number}
       */
      get threshold() {
        return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
      }

      /**
       *
       * @return {Matrix}
       */
      get leftSingularVectors() {
        if (!Matrix.isMatrix(this.U)) {
          this.U = new Matrix(this.U);
        }
        return this.U;
      }

      /**
       *
       * @return {Matrix}
       */
      get rightSingularVectors() {
        if (!Matrix.isMatrix(this.V)) {
          this.V = new Matrix(this.V);
        }
        return this.V;
      }

      /**
       *
       * @return {Matrix}
       */
      get diagonalMatrix() {
        return Matrix.diag(this.s);
      }
    }

    /**
     * @private
     * Check that a row index is not out of bounds
     * @param {Matrix} matrix
     * @param {number} index
     * @param {boolean} [outer]
     */
    function checkRowIndex(matrix, index, outer) {
      var max = outer ? matrix.rows : matrix.rows - 1;
      if (index < 0 || index > max) {
        throw new RangeError('Row index out of range');
      }
    }

    /**
     * @private
     * Check that a column index is not out of bounds
     * @param {Matrix} matrix
     * @param {number} index
     * @param {boolean} [outer]
     */
    function checkColumnIndex(matrix, index, outer) {
      var max = outer ? matrix.columns : matrix.columns - 1;
      if (index < 0 || index > max) {
        throw new RangeError('Column index out of range');
      }
    }

    /**
     * @private
     * Check that the provided vector is an array with the right length
     * @param {Matrix} matrix
     * @param {Array|Matrix} vector
     * @return {Array}
     * @throws {RangeError}
     */
    function checkRowVector(matrix, vector) {
      if (vector.to1DArray) {
        vector = vector.to1DArray();
      }
      if (vector.length !== matrix.columns) {
        throw new RangeError(
          'vector size must be the same as the number of columns'
        );
      }
      return vector;
    }

    /**
     * @private
     * Check that the provided vector is an array with the right length
     * @param {Matrix} matrix
     * @param {Array|Matrix} vector
     * @return {Array}
     * @throws {RangeError}
     */
    function checkColumnVector(matrix, vector) {
      if (vector.to1DArray) {
        vector = vector.to1DArray();
      }
      if (vector.length !== matrix.rows) {
        throw new RangeError('vector size must be the same as the number of rows');
      }
      return vector;
    }

    function checkIndices(matrix, rowIndices, columnIndices) {
      return {
        row: checkRowIndices(matrix, rowIndices),
        column: checkColumnIndices(matrix, columnIndices)
      };
    }

    function checkRowIndices(matrix, rowIndices) {
      if (typeof rowIndices !== 'object') {
        throw new TypeError('unexpected type for row indices');
      }

      var rowOut = rowIndices.some((r) => {
        return r < 0 || r >= matrix.rows;
      });

      if (rowOut) {
        throw new RangeError('row indices are out of range');
      }

      if (!Array.isArray(rowIndices)) rowIndices = Array.from(rowIndices);

      return rowIndices;
    }

    function checkColumnIndices(matrix, columnIndices) {
      if (typeof columnIndices !== 'object') {
        throw new TypeError('unexpected type for column indices');
      }

      var columnOut = columnIndices.some((c) => {
        return c < 0 || c >= matrix.columns;
      });

      if (columnOut) {
        throw new RangeError('column indices are out of range');
      }
      if (!Array.isArray(columnIndices)) columnIndices = Array.from(columnIndices);

      return columnIndices;
    }

    function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
      if (arguments.length !== 5) {
        throw new RangeError('expected 4 arguments');
      }
      checkNumber('startRow', startRow);
      checkNumber('endRow', endRow);
      checkNumber('startColumn', startColumn);
      checkNumber('endColumn', endColumn);
      if (
        startRow > endRow ||
        startColumn > endColumn ||
        startRow < 0 ||
        startRow >= matrix.rows ||
        endRow < 0 ||
        endRow >= matrix.rows ||
        startColumn < 0 ||
        startColumn >= matrix.columns ||
        endColumn < 0 ||
        endColumn >= matrix.columns
      ) {
        throw new RangeError('Submatrix indices are out of range');
      }
    }

    function sumByRow(matrix) {
      var sum = Matrix.zeros(matrix.rows, 1);
      for (var i = 0; i < matrix.rows; ++i) {
        for (var j = 0; j < matrix.columns; ++j) {
          sum.set(i, 0, sum.get(i, 0) + matrix.get(i, j));
        }
      }
      return sum;
    }

    function sumByColumn(matrix) {
      var sum = Matrix.zeros(1, matrix.columns);
      for (var i = 0; i < matrix.rows; ++i) {
        for (var j = 0; j < matrix.columns; ++j) {
          sum.set(0, j, sum.get(0, j) + matrix.get(i, j));
        }
      }
      return sum;
    }

    function sumAll(matrix) {
      var v = 0;
      for (var i = 0; i < matrix.rows; i++) {
        for (var j = 0; j < matrix.columns; j++) {
          v += matrix.get(i, j);
        }
      }
      return v;
    }

    function checkNumber(name, value) {
      if (typeof value !== 'number') {
        throw new TypeError(`${name} must be a number`);
      }
    }

    class BaseView extends AbstractMatrix() {
      constructor(matrix, rows, columns) {
        super();
        this.matrix = matrix;
        this.rows = rows;
        this.columns = columns;
      }

      static get [Symbol.species]() {
        return Matrix;
      }
    }

    class MatrixTransposeView extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.columns, matrix.rows);
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(columnIndex, rowIndex, value);
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(columnIndex, rowIndex);
      }
    }

    class MatrixRowView extends BaseView {
      constructor(matrix, row) {
        super(matrix, 1, matrix.columns);
        this.row = row;
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.row, columnIndex, value);
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(this.row, columnIndex);
      }
    }

    class MatrixSubView extends BaseView {
      constructor(matrix, startRow, endRow, startColumn, endColumn) {
        checkRange(matrix, startRow, endRow, startColumn, endColumn);
        super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
        this.startRow = startRow;
        this.startColumn = startColumn;
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(
          this.startRow + rowIndex,
          this.startColumn + columnIndex,
          value
        );
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(
          this.startRow + rowIndex,
          this.startColumn + columnIndex
        );
      }
    }

    class MatrixSelectionView extends BaseView {
      constructor(matrix, rowIndices, columnIndices) {
        var indices = checkIndices(matrix, rowIndices, columnIndices);
        super(matrix, indices.row.length, indices.column.length);
        this.rowIndices = indices.row;
        this.columnIndices = indices.column;
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(
          this.rowIndices[rowIndex],
          this.columnIndices[columnIndex],
          value
        );
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(
          this.rowIndices[rowIndex],
          this.columnIndices[columnIndex]
        );
      }
    }

    class MatrixRowSelectionView extends BaseView {
      constructor(matrix, rowIndices) {
        rowIndices = checkRowIndices(matrix, rowIndices);
        super(matrix, rowIndices.length, matrix.columns);
        this.rowIndices = rowIndices;
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
      }
    }

    class MatrixColumnSelectionView extends BaseView {
      constructor(matrix, columnIndices) {
        columnIndices = checkColumnIndices(matrix, columnIndices);
        super(matrix, matrix.rows, columnIndices.length);
        this.columnIndices = columnIndices;
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
      }
    }

    class MatrixColumnView extends BaseView {
      constructor(matrix, column) {
        super(matrix, matrix.rows, 1);
        this.column = column;
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.column, value);
        return this;
      }

      get(rowIndex) {
        return this.matrix.get(rowIndex, this.column);
      }
    }

    class MatrixFlipRowView extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.rows, matrix.columns);
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
      }
    }

    class MatrixFlipColumnView extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.rows, matrix.columns);
      }

      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
      }
    }

    function AbstractMatrix(superCtor) {
      if (superCtor === undefined) superCtor = Object;

      /**
       * Real matrix
       * @class Matrix
       * @param {number|Array|Matrix} nRows - Number of rows of the new matrix,
       * 2D array containing the data or Matrix instance to clone
       * @param {number} [nColumns] - Number of columns of the new matrix
       */
      class Matrix extends superCtor {
        static get [Symbol.species]() {
          return this;
        }

        /**
         * Constructs a Matrix with the chosen dimensions from a 1D array
         * @param {number} newRows - Number of rows
         * @param {number} newColumns - Number of columns
         * @param {Array} newData - A 1D array containing data for the matrix
         * @return {Matrix} - The new matrix
         */
        static from1DArray(newRows, newColumns, newData) {
          var length = newRows * newColumns;
          if (length !== newData.length) {
            throw new RangeError('Data length does not match given dimensions');
          }
          var newMatrix = new this(newRows, newColumns);
          for (var row = 0; row < newRows; row++) {
            for (var column = 0; column < newColumns; column++) {
              newMatrix.set(row, column, newData[row * newColumns + column]);
            }
          }
          return newMatrix;
        }

        /**
             * Creates a row vector, a matrix with only one row.
             * @param {Array} newData - A 1D array containing data for the vector
             * @return {Matrix} - The new matrix
             */
        static rowVector(newData) {
          var vector = new this(1, newData.length);
          for (var i = 0; i < newData.length; i++) {
            vector.set(0, i, newData[i]);
          }
          return vector;
        }

        /**
             * Creates a column vector, a matrix with only one column.
             * @param {Array} newData - A 1D array containing data for the vector
             * @return {Matrix} - The new matrix
             */
        static columnVector(newData) {
          var vector = new this(newData.length, 1);
          for (var i = 0; i < newData.length; i++) {
            vector.set(i, 0, newData[i]);
          }
          return vector;
        }

        /**
             * Creates an empty matrix with the given dimensions. Values will be undefined. Same as using new Matrix(rows, columns).
             * @param {number} rows - Number of rows
             * @param {number} columns - Number of columns
             * @return {Matrix} - The new matrix
             */
        static empty(rows, columns) {
          return new this(rows, columns);
        }

        /**
             * Creates a matrix with the given dimensions. Values will be set to zero.
             * @param {number} rows - Number of rows
             * @param {number} columns - Number of columns
             * @return {Matrix} - The new matrix
             */
        static zeros(rows, columns) {
          return this.empty(rows, columns).fill(0);
        }

        /**
             * Creates a matrix with the given dimensions. Values will be set to one.
             * @param {number} rows - Number of rows
             * @param {number} columns - Number of columns
             * @return {Matrix} - The new matrix
             */
        static ones(rows, columns) {
          return this.empty(rows, columns).fill(1);
        }

        /**
             * Creates a matrix with the given dimensions. Values will be randomly set.
             * @param {number} rows - Number of rows
             * @param {number} columns - Number of columns
             * @param {function} [rng=Math.random] - Random number generator
             * @return {Matrix} The new matrix
             */
        static rand(rows, columns, rng) {
          if (rng === undefined) rng = Math.random;
          var matrix = this.empty(rows, columns);
          for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
              matrix.set(i, j, rng());
            }
          }
          return matrix;
        }

        /**
             * Creates a matrix with the given dimensions. Values will be random integers.
             * @param {number} rows - Number of rows
             * @param {number} columns - Number of columns
             * @param {number} [maxValue=1000] - Maximum value
             * @param {function} [rng=Math.random] - Random number generator
             * @return {Matrix} The new matrix
             */
        static randInt(rows, columns, maxValue, rng) {
          if (maxValue === undefined) maxValue = 1000;
          if (rng === undefined) rng = Math.random;
          var matrix = this.empty(rows, columns);
          for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
              var value = Math.floor(rng() * maxValue);
              matrix.set(i, j, value);
            }
          }
          return matrix;
        }

        /**
             * Creates an identity matrix with the given dimension. Values of the diagonal will be 1 and others will be 0.
             * @param {number} rows - Number of rows
             * @param {number} [columns=rows] - Number of columns
             * @param {number} [value=1] - Value to fill the diagonal with
             * @return {Matrix} - The new identity matrix
             */
        static eye(rows, columns, value) {
          if (columns === undefined) columns = rows;
          if (value === undefined) value = 1;
          var min = Math.min(rows, columns);
          var matrix = this.zeros(rows, columns);
          for (var i = 0; i < min; i++) {
            matrix.set(i, i, value);
          }
          return matrix;
        }

        /**
             * Creates a diagonal matrix based on the given array.
             * @param {Array} data - Array containing the data for the diagonal
             * @param {number} [rows] - Number of rows (Default: data.length)
             * @param {number} [columns] - Number of columns (Default: rows)
             * @return {Matrix} - The new diagonal matrix
             */
        static diag(data, rows, columns) {
          var l = data.length;
          if (rows === undefined) rows = l;
          if (columns === undefined) columns = rows;
          var min = Math.min(l, rows, columns);
          var matrix = this.zeros(rows, columns);
          for (var i = 0; i < min; i++) {
            matrix.set(i, i, data[i]);
          }
          return matrix;
        }

        /**
             * Returns a matrix whose elements are the minimum between matrix1 and matrix2
             * @param {Matrix} matrix1
             * @param {Matrix} matrix2
             * @return {Matrix}
             */
        static min(matrix1, matrix2) {
          matrix1 = this.checkMatrix(matrix1);
          matrix2 = this.checkMatrix(matrix2);
          var rows = matrix1.rows;
          var columns = matrix1.columns;
          var result = new this(rows, columns);
          for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
              result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
            }
          }
          return result;
        }

        /**
             * Returns a matrix whose elements are the maximum between matrix1 and matrix2
             * @param {Matrix} matrix1
             * @param {Matrix} matrix2
             * @return {Matrix}
             */
        static max(matrix1, matrix2) {
          matrix1 = this.checkMatrix(matrix1);
          matrix2 = this.checkMatrix(matrix2);
          var rows = matrix1.rows;
          var columns = matrix1.columns;
          var result = new this(rows, columns);
          for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
              result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
            }
          }
          return result;
        }

        /**
             * Check that the provided value is a Matrix and tries to instantiate one if not
             * @param {*} value - The value to check
             * @return {Matrix}
             */
        static checkMatrix(value) {
          return Matrix.isMatrix(value) ? value : new this(value);
        }

        /**
             * Returns true if the argument is a Matrix, false otherwise
             * @param {*} value - The value to check
             * @return {boolean}
             */
        static isMatrix(value) {
          return (value != null) && (value.klass === 'Matrix');
        }

        /**
             * @prop {number} size - The number of elements in the matrix.
             */
        get size() {
          return this.rows * this.columns;
        }

        /**
             * Applies a callback for each element of the matrix. The function is called in the matrix (this) context.
             * @param {function} callback - Function that will be called with two parameters : i (row) and j (column)
             * @return {Matrix} this
             */
        apply(callback) {
          if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
          }
          var ii = this.rows;
          var jj = this.columns;
          for (var i = 0; i < ii; i++) {
            for (var j = 0; j < jj; j++) {
              callback.call(this, i, j);
            }
          }
          return this;
        }

        /**
             * Returns a new 1D array filled row by row with the matrix values
             * @return {Array}
             */
        to1DArray() {
          var array = new Array(this.size);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              array[i * this.columns + j] = this.get(i, j);
            }
          }
          return array;
        }

        /**
             * Returns a 2D array containing a copy of the data
             * @return {Array}
             */
        to2DArray() {
          var copy = new Array(this.rows);
          for (var i = 0; i < this.rows; i++) {
            copy[i] = new Array(this.columns);
            for (var j = 0; j < this.columns; j++) {
              copy[i][j] = this.get(i, j);
            }
          }
          return copy;
        }

        /**
             * @return {boolean} true if the matrix has one row
             */
        isRowVector() {
          return this.rows === 1;
        }

        /**
             * @return {boolean} true if the matrix has one column
             */
        isColumnVector() {
          return this.columns === 1;
        }

        /**
             * @return {boolean} true if the matrix has one row or one column
             */
        isVector() {
          return (this.rows === 1) || (this.columns === 1);
        }

        /**
             * @return {boolean} true if the matrix has the same number of rows and columns
             */
        isSquare() {
          return this.rows === this.columns;
        }

        /**
             * @return {boolean} true if the matrix is square and has the same values on both sides of the diagonal
             */
        isSymmetric() {
          if (this.isSquare()) {
            for (var i = 0; i < this.rows; i++) {
              for (var j = 0; j <= i; j++) {
                if (this.get(i, j) !== this.get(j, i)) {
                  return false;
                }
              }
            }
            return true;
          }
          return false;
        }

        /**
              * @return true if the matrix is in echelon form
              */
        isEchelonForm() {
          let i = 0;
          let j = 0;
          let previousColumn = -1;
          let isEchelonForm = true;
          let checked = false;
          while ((i < this.rows) && (isEchelonForm)) {
            j = 0;
            checked = false;
            while ((j < this.columns) && (checked === false)) {
              if (this.get(i, j) === 0) {
                j++;
              } else if ((this.get(i, j) === 1) && (j > previousColumn)) {
                checked = true;
                previousColumn = j;
              } else {
                isEchelonForm = false;
                checked = true;
              }
            }
            i++;
          }
          return isEchelonForm;
        }

        /**
                 * @return true if the matrix is in reduced echelon form
                 */
        isReducedEchelonForm() {
          let i = 0;
          let j = 0;
          let previousColumn = -1;
          let isReducedEchelonForm = true;
          let checked = false;
          while ((i < this.rows) && (isReducedEchelonForm)) {
            j = 0;
            checked = false;
            while ((j < this.columns) && (checked === false)) {
              if (this.get(i, j) === 0) {
                j++;
              } else if ((this.get(i, j) === 1) && (j > previousColumn)) {
                checked = true;
                previousColumn = j;
              } else {
                isReducedEchelonForm = false;
                checked = true;
              }
            }
            for (let k = j + 1; k < this.rows; k++) {
              if (this.get(i, k) !== 0) {
                isReducedEchelonForm = false;
              }
            }
            i++;
          }
          return isReducedEchelonForm;
        }

        /**
             * Sets a given element of the matrix. mat.set(3,4,1) is equivalent to mat[3][4]=1
             * @abstract
             * @param {number} rowIndex - Index of the row
             * @param {number} columnIndex - Index of the column
             * @param {number} value - The new value for the element
             * @return {Matrix} this
             */
        set(rowIndex, columnIndex, value) { // eslint-disable-line no-unused-vars
          throw new Error('set method is unimplemented');
        }

        /**
             * Returns the given element of the matrix. mat.get(3,4) is equivalent to matrix[3][4]
             * @abstract
             * @param {number} rowIndex - Index of the row
             * @param {number} columnIndex - Index of the column
             * @return {number}
             */
        get(rowIndex, columnIndex) { // eslint-disable-line no-unused-vars
          throw new Error('get method is unimplemented');
        }

        /**
             * Creates a new matrix that is a repetition of the current matrix. New matrix has rowRep times the number of
             * rows of the matrix, and colRep times the number of columns of the matrix
             * @param {number} rowRep - Number of times the rows should be repeated
             * @param {number} colRep - Number of times the columns should be re
             * @return {Matrix}
             * @example
             * var matrix = new Matrix([[1,2]]);
             * matrix.repeat(2); // [[1,2],[1,2]]
             */
        repeat(rowRep, colRep) {
          rowRep = rowRep || 1;
          colRep = colRep || 1;
          var matrix = new this.constructor[Symbol.species](this.rows * rowRep, this.columns * colRep);
          for (var i = 0; i < rowRep; i++) {
            for (var j = 0; j < colRep; j++) {
              matrix.setSubMatrix(this, this.rows * i, this.columns * j);
            }
          }
          return matrix;
        }

        /**
             * Fills the matrix with a given value. All elements will be set to this value.
             * @param {number} value - New value
             * @return {Matrix} this
             */
        fill(value) {
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, value);
            }
          }
          return this;
        }

        /**
             * Negates the matrix. All elements will be multiplied by (-1)
             * @return {Matrix} this
             */
        neg() {
          return this.mulS(-1);
        }

        /**
             * Returns a new array from the given row index
             * @param {number} index - Row index
             * @return {Array}
             */
        getRow(index) {
          checkRowIndex(this, index);
          var row = new Array(this.columns);
          for (var i = 0; i < this.columns; i++) {
            row[i] = this.get(index, i);
          }
          return row;
        }

        /**
             * Returns a new row vector from the given row index
             * @param {number} index - Row index
             * @return {Matrix}
             */
        getRowVector(index) {
          return this.constructor.rowVector(this.getRow(index));
        }

        /**
             * Sets a row at the given index
             * @param {number} index - Row index
             * @param {Array|Matrix} array - Array or vector
             * @return {Matrix} this
             */
        setRow(index, array) {
          checkRowIndex(this, index);
          array = checkRowVector(this, array);
          for (var i = 0; i < this.columns; i++) {
            this.set(index, i, array[i]);
          }
          return this;
        }

        /**
             * Swaps two rows
             * @param {number} row1 - First row index
             * @param {number} row2 - Second row index
             * @return {Matrix} this
             */
        swapRows(row1, row2) {
          checkRowIndex(this, row1);
          checkRowIndex(this, row2);
          for (var i = 0; i < this.columns; i++) {
            var temp = this.get(row1, i);
            this.set(row1, i, this.get(row2, i));
            this.set(row2, i, temp);
          }
          return this;
        }

        /**
             * Returns a new array from the given column index
             * @param {number} index - Column index
             * @return {Array}
             */
        getColumn(index) {
          checkColumnIndex(this, index);
          var column = new Array(this.rows);
          for (var i = 0; i < this.rows; i++) {
            column[i] = this.get(i, index);
          }
          return column;
        }

        /**
             * Returns a new column vector from the given column index
             * @param {number} index - Column index
             * @return {Matrix}
             */
        getColumnVector(index) {
          return this.constructor.columnVector(this.getColumn(index));
        }

        /**
             * Sets a column at the given index
             * @param {number} index - Column index
             * @param {Array|Matrix} array - Array or vector
             * @return {Matrix} this
             */
        setColumn(index, array) {
          checkColumnIndex(this, index);
          array = checkColumnVector(this, array);
          for (var i = 0; i < this.rows; i++) {
            this.set(i, index, array[i]);
          }
          return this;
        }

        /**
             * Swaps two columns
             * @param {number} column1 - First column index
             * @param {number} column2 - Second column index
             * @return {Matrix} this
             */
        swapColumns(column1, column2) {
          checkColumnIndex(this, column1);
          checkColumnIndex(this, column2);
          for (var i = 0; i < this.rows; i++) {
            var temp = this.get(i, column1);
            this.set(i, column1, this.get(i, column2));
            this.set(i, column2, temp);
          }
          return this;
        }

        /**
             * Adds the values of a vector to each row
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        addRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) + vector[j]);
            }
          }
          return this;
        }

        /**
             * Subtracts the values of a vector from each row
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        subRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) - vector[j]);
            }
          }
          return this;
        }

        /**
             * Multiplies the values of a vector with each row
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        mulRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) * vector[j]);
            }
          }
          return this;
        }

        /**
             * Divides the values of each row by those of a vector
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        divRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) / vector[j]);
            }
          }
          return this;
        }

        /**
             * Adds the values of a vector to each column
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        addColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) + vector[i]);
            }
          }
          return this;
        }

        /**
             * Subtracts the values of a vector from each column
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        subColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) - vector[i]);
            }
          }
          return this;
        }

        /**
             * Multiplies the values of a vector with each column
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        mulColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) * vector[i]);
            }
          }
          return this;
        }

        /**
             * Divides the values of each column by those of a vector
             * @param {Array|Matrix} vector - Array or vector
             * @return {Matrix} this
             */
        divColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              this.set(i, j, this.get(i, j) / vector[i]);
            }
          }
          return this;
        }

        /**
             * Multiplies the values of a row with a scalar
             * @param {number} index - Row index
             * @param {number} value
             * @return {Matrix} this
             */
        mulRow(index, value) {
          checkRowIndex(this, index);
          for (var i = 0; i < this.columns; i++) {
            this.set(index, i, this.get(index, i) * value);
          }
          return this;
        }

        /**
             * Multiplies the values of a column with a scalar
             * @param {number} index - Column index
             * @param {number} value
             * @return {Matrix} this
             */
        mulColumn(index, value) {
          checkColumnIndex(this, index);
          for (var i = 0; i < this.rows; i++) {
            this.set(i, index, this.get(i, index) * value);
          }
          return this;
        }

        /**
             * Returns the maximum value of the matrix
             * @return {number}
             */
        max() {
          var v = this.get(0, 0);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              if (this.get(i, j) > v) {
                v = this.get(i, j);
              }
            }
          }
          return v;
        }

        /**
             * Returns the index of the maximum value
             * @return {Array}
             */
        maxIndex() {
          var v = this.get(0, 0);
          var idx = [0, 0];
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              if (this.get(i, j) > v) {
                v = this.get(i, j);
                idx[0] = i;
                idx[1] = j;
              }
            }
          }
          return idx;
        }

        /**
             * Returns the minimum value of the matrix
             * @return {number}
             */
        min() {
          var v = this.get(0, 0);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              if (this.get(i, j) < v) {
                v = this.get(i, j);
              }
            }
          }
          return v;
        }

        /**
             * Returns the index of the minimum value
             * @return {Array}
             */
        minIndex() {
          var v = this.get(0, 0);
          var idx = [0, 0];
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              if (this.get(i, j) < v) {
                v = this.get(i, j);
                idx[0] = i;
                idx[1] = j;
              }
            }
          }
          return idx;
        }

        /**
             * Returns the maximum value of one row
             * @param {number} row - Row index
             * @return {number}
             */
        maxRow(row) {
          checkRowIndex(this, row);
          var v = this.get(row, 0);
          for (var i = 1; i < this.columns; i++) {
            if (this.get(row, i) > v) {
              v = this.get(row, i);
            }
          }
          return v;
        }

        /**
             * Returns the index of the maximum value of one row
             * @param {number} row - Row index
             * @return {Array}
             */
        maxRowIndex(row) {
          checkRowIndex(this, row);
          var v = this.get(row, 0);
          var idx = [row, 0];
          for (var i = 1; i < this.columns; i++) {
            if (this.get(row, i) > v) {
              v = this.get(row, i);
              idx[1] = i;
            }
          }
          return idx;
        }

        /**
             * Returns the minimum value of one row
             * @param {number} row - Row index
             * @return {number}
             */
        minRow(row) {
          checkRowIndex(this, row);
          var v = this.get(row, 0);
          for (var i = 1; i < this.columns; i++) {
            if (this.get(row, i) < v) {
              v = this.get(row, i);
            }
          }
          return v;
        }

        /**
             * Returns the index of the maximum value of one row
             * @param {number} row - Row index
             * @return {Array}
             */
        minRowIndex(row) {
          checkRowIndex(this, row);
          var v = this.get(row, 0);
          var idx = [row, 0];
          for (var i = 1; i < this.columns; i++) {
            if (this.get(row, i) < v) {
              v = this.get(row, i);
              idx[1] = i;
            }
          }
          return idx;
        }

        /**
             * Returns the maximum value of one column
             * @param {number} column - Column index
             * @return {number}
             */
        maxColumn(column) {
          checkColumnIndex(this, column);
          var v = this.get(0, column);
          for (var i = 1; i < this.rows; i++) {
            if (this.get(i, column) > v) {
              v = this.get(i, column);
            }
          }
          return v;
        }

        /**
             * Returns the index of the maximum value of one column
             * @param {number} column - Column index
             * @return {Array}
             */
        maxColumnIndex(column) {
          checkColumnIndex(this, column);
          var v = this.get(0, column);
          var idx = [0, column];
          for (var i = 1; i < this.rows; i++) {
            if (this.get(i, column) > v) {
              v = this.get(i, column);
              idx[0] = i;
            }
          }
          return idx;
        }

        /**
             * Returns the minimum value of one column
             * @param {number} column - Column index
             * @return {number}
             */
        minColumn(column) {
          checkColumnIndex(this, column);
          var v = this.get(0, column);
          for (var i = 1; i < this.rows; i++) {
            if (this.get(i, column) < v) {
              v = this.get(i, column);
            }
          }
          return v;
        }

        /**
             * Returns the index of the minimum value of one column
             * @param {number} column - Column index
             * @return {Array}
             */
        minColumnIndex(column) {
          checkColumnIndex(this, column);
          var v = this.get(0, column);
          var idx = [0, column];
          for (var i = 1; i < this.rows; i++) {
            if (this.get(i, column) < v) {
              v = this.get(i, column);
              idx[0] = i;
            }
          }
          return idx;
        }

        /**
             * Returns an array containing the diagonal values of the matrix
             * @return {Array}
             */
        diag() {
          var min = Math.min(this.rows, this.columns);
          var diag = new Array(min);
          for (var i = 0; i < min; i++) {
            diag[i] = this.get(i, i);
          }
          return diag;
        }

        /**
             * Returns the sum by the argument given, if no argument given,
             * it returns the sum of all elements of the matrix.
             * @param {string} by - sum by 'row' or 'column'.
             * @return {Matrix|number}
             */
        sum(by) {
          switch (by) {
            case 'row':
              return sumByRow(this);
            case 'column':
              return sumByColumn(this);
            default:
              return sumAll(this);
          }
        }

        /**
             * Returns the mean of all elements of the matrix
             * @return {number}
             */
        mean() {
          return this.sum() / this.size;
        }

        /**
             * Returns the product of all elements of the matrix
             * @return {number}
             */
        prod() {
          var prod = 1;
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              prod *= this.get(i, j);
            }
          }
          return prod;
        }

        /**
             * Returns the norm of a matrix.
             * @param {string} type - "frobenius" (default) or "max" return resp. the Frobenius norm and the max norm.
             * @return {number}
             */
        norm(type = 'frobenius') {
          var result = 0;
          if (type === 'max') {
            return this.max();
          } else if (type === 'frobenius') {
            for (var i = 0; i < this.rows; i++) {
              for (var j = 0; j < this.columns; j++) {
                result = result + this.get(i, j) * this.get(i, j);
              }
            }
            return Math.sqrt(result);
          } else {
            throw new RangeError(`unknown norm type: ${type}`);
          }
        }

        /**
             * Computes the cumulative sum of the matrix elements (in place, row by row)
             * @return {Matrix} this
             */
        cumulativeSum() {
          var sum = 0;
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              sum += this.get(i, j);
              this.set(i, j, sum);
            }
          }
          return this;
        }

        /**
             * Computes the dot (scalar) product between the matrix and another
             * @param {Matrix} vector2 vector
             * @return {number}
             */
        dot(vector2) {
          if (Matrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
          var vector1 = this.to1DArray();
          if (vector1.length !== vector2.length) {
            throw new RangeError('vectors do not have the same size');
          }
          var dot = 0;
          for (var i = 0; i < vector1.length; i++) {
            dot += vector1[i] * vector2[i];
          }
          return dot;
        }

        /**
             * Returns the matrix product between this and other
             * @param {Matrix} other
             * @return {Matrix}
             */
        mmul(other) {
          other = this.constructor.checkMatrix(other);
          if (this.columns !== other.rows) {
            // eslint-disable-next-line no-console
            console.warn('Number of columns of left matrix are not equal to number of rows of right matrix.');
          }

          var m = this.rows;
          var n = this.columns;
          var p = other.columns;

          var result = new this.constructor[Symbol.species](m, p);

          var Bcolj = new Array(n);
          for (var j = 0; j < p; j++) {
            for (var k = 0; k < n; k++) {
              Bcolj[k] = other.get(k, j);
            }

            for (var i = 0; i < m; i++) {
              var s = 0;
              for (k = 0; k < n; k++) {
                s += this.get(i, k) * Bcolj[k];
              }

              result.set(i, j, s);
            }
          }
          return result;
        }

        strassen2x2(other) {
          var result = new this.constructor[Symbol.species](2, 2);
          const a11 = this.get(0, 0);
          const b11 = other.get(0, 0);
          const a12 = this.get(0, 1);
          const b12 = other.get(0, 1);
          const a21 = this.get(1, 0);
          const b21 = other.get(1, 0);
          const a22 = this.get(1, 1);
          const b22 = other.get(1, 1);

          // Compute intermediate values.
          const m1 = (a11 + a22) * (b11 + b22);
          const m2 = (a21 + a22) * b11;
          const m3 = a11 * (b12 - b22);
          const m4 = a22 * (b21 - b11);
          const m5 = (a11 + a12) * b22;
          const m6 = (a21 - a11) * (b11 + b12);
          const m7 = (a12 - a22) * (b21 + b22);

          // Combine intermediate values into the output.
          const c00 = m1 + m4 - m5 + m7;
          const c01 = m3 + m5;
          const c10 = m2 + m4;
          const c11 = m1 - m2 + m3 + m6;

          result.set(0, 0, c00);
          result.set(0, 1, c01);
          result.set(1, 0, c10);
          result.set(1, 1, c11);
          return result;
        }

        strassen3x3(other) {
          var result = new this.constructor[Symbol.species](3, 3);

          const a00 = this.get(0, 0);
          const a01 = this.get(0, 1);
          const a02 = this.get(0, 2);
          const a10 = this.get(1, 0);
          const a11 = this.get(1, 1);
          const a12 = this.get(1, 2);
          const a20 = this.get(2, 0);
          const a21 = this.get(2, 1);
          const a22 = this.get(2, 2);

          const b00 = other.get(0, 0);
          const b01 = other.get(0, 1);
          const b02 = other.get(0, 2);
          const b10 = other.get(1, 0);
          const b11 = other.get(1, 1);
          const b12 = other.get(1, 2);
          const b20 = other.get(2, 0);
          const b21 = other.get(2, 1);
          const b22 = other.get(2, 2);

          const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
          const m2 = (a00 - a10) * (-b01 + b11);
          const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
          const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
          const m5 = (a10 + a11) * (-b00 + b01);
          const m6 = a00 * b00;
          const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
          const m8 = (-a00 + a20) * (b02 - b12);
          const m9 = (a20 + a21) * (-b00 + b02);
          const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
          const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
          const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
          const m13 = (a02 - a22) * (b11 - b21);
          const m14 = a02 * b20;
          const m15 = (a21 + a22) * (-b20 + b21);
          const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
          const m17 = (a02 - a12) * (b12 - b22);
          const m18 = (a11 + a12) * (-b20 + b22);
          const m19 = a01 * b10;
          const m20 = a12 * b21;
          const m21 = a10 * b02;
          const m22 = a20 * b01;
          const m23 = a22 * b22;

          const c00 = m6 + m14 + m19;
          const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
          const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
          const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
          const c11 = m2 + m4 + m5 + m6 + m20;
          const c12 = m14 + m16 + m17 + m18 + m21;
          const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
          const c21 = m12 + m13 + m14 + m15 + m22;
          const c22 = m6 + m7 + m8 + m9 + m23;

          result.set(0, 0, c00);
          result.set(0, 1, c01);
          result.set(0, 2, c02);
          result.set(1, 0, c10);
          result.set(1, 1, c11);
          result.set(1, 2, c12);
          result.set(2, 0, c20);
          result.set(2, 1, c21);
          result.set(2, 2, c22);
          return result;
        }

        /**
             * Returns the matrix product between x and y. More efficient than mmul(other) only when we multiply squared matrix and when the size of the matrix is > 1000.
             * @param {Matrix} y
             * @return {Matrix}
             */
        mmulStrassen(y) {
          var x = this.clone();
          var r1 = x.rows;
          var c1 = x.columns;
          var r2 = y.rows;
          var c2 = y.columns;
          if (c1 !== r2) {
            // eslint-disable-next-line no-console
            console.warn(`Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`);
          }

          // Put a matrix into the top left of a matrix of zeros.
          // `rows` and `cols` are the dimensions of the output matrix.
          function embed(mat, rows, cols) {
            var r = mat.rows;
            var c = mat.columns;
            if ((r === rows) && (c === cols)) {
              return mat;
            } else {
              var resultat = Matrix.zeros(rows, cols);
              resultat = resultat.setSubMatrix(mat, 0, 0);
              return resultat;
            }
          }


          // Make sure both matrices are the same size.
          // This is exclusively for simplicity:
          // this algorithm can be implemented with matrices of different sizes.

          var r = Math.max(r1, r2);
          var c = Math.max(c1, c2);
          x = embed(x, r, c);
          y = embed(y, r, c);

          // Our recursive multiplication function.
          function blockMult(a, b, rows, cols) {
            // For small matrices, resort to naive multiplication.
            if (rows <= 512 || cols <= 512) {
              return a.mmul(b); // a is equivalent to this
            }

            // Apply dynamic padding.
            if ((rows % 2 === 1) && (cols % 2 === 1)) {
              a = embed(a, rows + 1, cols + 1);
              b = embed(b, rows + 1, cols + 1);
            } else if (rows % 2 === 1) {
              a = embed(a, rows + 1, cols);
              b = embed(b, rows + 1, cols);
            } else if (cols % 2 === 1) {
              a = embed(a, rows, cols + 1);
              b = embed(b, rows, cols + 1);
            }

            var halfRows = parseInt(a.rows / 2, 10);
            var halfCols = parseInt(a.columns / 2, 10);
            // Subdivide input matrices.
            var a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
            var b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);

            var a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
            var b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);

            var a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
            var b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);

            var a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
            var b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);

            // Compute intermediate values.
            var m1 = blockMult(Matrix.add(a11, a22), Matrix.add(b11, b22), halfRows, halfCols);
            var m2 = blockMult(Matrix.add(a21, a22), b11, halfRows, halfCols);
            var m3 = blockMult(a11, Matrix.sub(b12, b22), halfRows, halfCols);
            var m4 = blockMult(a22, Matrix.sub(b21, b11), halfRows, halfCols);
            var m5 = blockMult(Matrix.add(a11, a12), b22, halfRows, halfCols);
            var m6 = blockMult(Matrix.sub(a21, a11), Matrix.add(b11, b12), halfRows, halfCols);
            var m7 = blockMult(Matrix.sub(a12, a22), Matrix.add(b21, b22), halfRows, halfCols);

            // Combine intermediate values into the output.
            var c11 = Matrix.add(m1, m4);
            c11.sub(m5);
            c11.add(m7);
            var c12 = Matrix.add(m3, m5);
            var c21 = Matrix.add(m2, m4);
            var c22 = Matrix.sub(m1, m2);
            c22.add(m3);
            c22.add(m6);

            // Crop output to the desired size (undo dynamic padding).
            var resultat = Matrix.zeros(2 * c11.rows, 2 * c11.columns);
            resultat = resultat.setSubMatrix(c11, 0, 0);
            resultat = resultat.setSubMatrix(c12, c11.rows, 0);
            resultat = resultat.setSubMatrix(c21, 0, c11.columns);
            resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
            return resultat.subMatrix(0, rows - 1, 0, cols - 1);
          }
          return blockMult(x, y, r, c);
        }

        /**
             * Returns a row-by-row scaled matrix
             * @param {number} [min=0] - Minimum scaled value
             * @param {number} [max=1] - Maximum scaled value
             * @return {Matrix} - The scaled matrix
             */
        scaleRows(min, max) {
          min = min === undefined ? 0 : min;
          max = max === undefined ? 1 : max;
          if (min >= max) {
            throw new RangeError('min should be strictly smaller than max');
          }
          var newMatrix = this.constructor.empty(this.rows, this.columns);
          for (var i = 0; i < this.rows; i++) {
            var scaled = rescale(this.getRow(i), { min, max });
            newMatrix.setRow(i, scaled);
          }
          return newMatrix;
        }

        /**
             * Returns a new column-by-column scaled matrix
             * @param {number} [min=0] - Minimum scaled value
             * @param {number} [max=1] - Maximum scaled value
             * @return {Matrix} - The new scaled matrix
             * @example
             * var matrix = new Matrix([[1,2],[-1,0]]);
             * var scaledMatrix = matrix.scaleColumns(); // [[1,1],[0,0]]
             */
        scaleColumns(min, max) {
          min = min === undefined ? 0 : min;
          max = max === undefined ? 1 : max;
          if (min >= max) {
            throw new RangeError('min should be strictly smaller than max');
          }
          var newMatrix = this.constructor.empty(this.rows, this.columns);
          for (var i = 0; i < this.columns; i++) {
            var scaled = rescale(this.getColumn(i), {
              min: min,
              max: max
            });
            newMatrix.setColumn(i, scaled);
          }
          return newMatrix;
        }


        /**
             * Returns the Kronecker product (also known as tensor product) between this and other
             * See https://en.wikipedia.org/wiki/Kronecker_product
             * @param {Matrix} other
             * @return {Matrix}
             */
        kroneckerProduct(other) {
          other = this.constructor.checkMatrix(other);

          var m = this.rows;
          var n = this.columns;
          var p = other.rows;
          var q = other.columns;

          var result = new this.constructor[Symbol.species](m * p, n * q);
          for (var i = 0; i < m; i++) {
            for (var j = 0; j < n; j++) {
              for (var k = 0; k < p; k++) {
                for (var l = 0; l < q; l++) {
                  result[p * i + k][q * j + l] = this.get(i, j) * other.get(k, l);
                }
              }
            }
          }
          return result;
        }

        /**
             * Transposes the matrix and returns a new one containing the result
             * @return {Matrix}
             */
        transpose() {
          var result = new this.constructor[Symbol.species](this.columns, this.rows);
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              result.set(j, i, this.get(i, j));
            }
          }
          return result;
        }

        /**
             * Sorts the rows (in place)
             * @param {function} compareFunction - usual Array.prototype.sort comparison function
             * @return {Matrix} this
             */
        sortRows(compareFunction) {
          if (compareFunction === undefined) compareFunction = compareNumbers;
          for (var i = 0; i < this.rows; i++) {
            this.setRow(i, this.getRow(i).sort(compareFunction));
          }
          return this;
        }

        /**
             * Sorts the columns (in place)
             * @param {function} compareFunction - usual Array.prototype.sort comparison function
             * @return {Matrix} this
             */
        sortColumns(compareFunction) {
          if (compareFunction === undefined) compareFunction = compareNumbers;
          for (var i = 0; i < this.columns; i++) {
            this.setColumn(i, this.getColumn(i).sort(compareFunction));
          }
          return this;
        }

        /**
             * Returns a subset of the matrix
             * @param {number} startRow - First row index
             * @param {number} endRow - Last row index
             * @param {number} startColumn - First column index
             * @param {number} endColumn - Last column index
             * @return {Matrix}
             */
        subMatrix(startRow, endRow, startColumn, endColumn) {
          checkRange(this, startRow, endRow, startColumn, endColumn);
          var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, endColumn - startColumn + 1);
          for (var i = startRow; i <= endRow; i++) {
            for (var j = startColumn; j <= endColumn; j++) {
              newMatrix[i - startRow][j - startColumn] = this.get(i, j);
            }
          }
          return newMatrix;
        }

        /**
             * Returns a subset of the matrix based on an array of row indices
             * @param {Array} indices - Array containing the row indices
             * @param {number} [startColumn = 0] - First column index
             * @param {number} [endColumn = this.columns-1] - Last column index
             * @return {Matrix}
             */
        subMatrixRow(indices, startColumn, endColumn) {
          if (startColumn === undefined) startColumn = 0;
          if (endColumn === undefined) endColumn = this.columns - 1;
          if ((startColumn > endColumn) || (startColumn < 0) || (startColumn >= this.columns) || (endColumn < 0) || (endColumn >= this.columns)) {
            throw new RangeError('Argument out of range');
          }

          var newMatrix = new this.constructor[Symbol.species](indices.length, endColumn - startColumn + 1);
          for (var i = 0; i < indices.length; i++) {
            for (var j = startColumn; j <= endColumn; j++) {
              if (indices[i] < 0 || indices[i] >= this.rows) {
                throw new RangeError(`Row index out of range: ${indices[i]}`);
              }
              newMatrix.set(i, j - startColumn, this.get(indices[i], j));
            }
          }
          return newMatrix;
        }

        /**
             * Returns a subset of the matrix based on an array of column indices
             * @param {Array} indices - Array containing the column indices
             * @param {number} [startRow = 0] - First row index
             * @param {number} [endRow = this.rows-1] - Last row index
             * @return {Matrix}
             */
        subMatrixColumn(indices, startRow, endRow) {
          if (startRow === undefined) startRow = 0;
          if (endRow === undefined) endRow = this.rows - 1;
          if ((startRow > endRow) || (startRow < 0) || (startRow >= this.rows) || (endRow < 0) || (endRow >= this.rows)) {
            throw new RangeError('Argument out of range');
          }

          var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, indices.length);
          for (var i = 0; i < indices.length; i++) {
            for (var j = startRow; j <= endRow; j++) {
              if (indices[i] < 0 || indices[i] >= this.columns) {
                throw new RangeError(`Column index out of range: ${indices[i]}`);
              }
              newMatrix.set(j - startRow, i, this.get(j, indices[i]));
            }
          }
          return newMatrix;
        }

        /**
             * Set a part of the matrix to the given sub-matrix
             * @param {Matrix|Array< Array >} matrix - The source matrix from which to extract values.
             * @param {number} startRow - The index of the first row to set
             * @param {number} startColumn - The index of the first column to set
             * @return {Matrix}
             */
        setSubMatrix(matrix, startRow, startColumn) {
          matrix = this.constructor.checkMatrix(matrix);
          var endRow = startRow + matrix.rows - 1;
          var endColumn = startColumn + matrix.columns - 1;
          checkRange(this, startRow, endRow, startColumn, endColumn);
          for (var i = 0; i < matrix.rows; i++) {
            for (var j = 0; j < matrix.columns; j++) {
              this[startRow + i][startColumn + j] = matrix.get(i, j);
            }
          }
          return this;
        }

        /**
             * Return a new matrix based on a selection of rows and columns
             * @param {Array<number>} rowIndices - The row indices to select. Order matters and an index can be more than once.
             * @param {Array<number>} columnIndices - The column indices to select. Order matters and an index can be use more than once.
             * @return {Matrix} The new matrix
             */
        selection(rowIndices, columnIndices) {
          var indices = checkIndices(this, rowIndices, columnIndices);
          var newMatrix = new this.constructor[Symbol.species](rowIndices.length, columnIndices.length);
          for (var i = 0; i < indices.row.length; i++) {
            var rowIndex = indices.row[i];
            for (var j = 0; j < indices.column.length; j++) {
              var columnIndex = indices.column[j];
              newMatrix[i][j] = this.get(rowIndex, columnIndex);
            }
          }
          return newMatrix;
        }

        /**
             * Returns the trace of the matrix (sum of the diagonal elements)
             * @return {number}
             */
        trace() {
          var min = Math.min(this.rows, this.columns);
          var trace = 0;
          for (var i = 0; i < min; i++) {
            trace += this.get(i, i);
          }
          return trace;
        }

        /*
             Matrix views
             */

        /**
             * Returns a view of the transposition of the matrix
             * @return {MatrixTransposeView}
             */
        transposeView() {
          return new MatrixTransposeView(this);
        }

        /**
             * Returns a view of the row vector with the given index
             * @param {number} row - row index of the vector
             * @return {MatrixRowView}
             */
        rowView(row) {
          checkRowIndex(this, row);
          return new MatrixRowView(this, row);
        }

        /**
             * Returns a view of the column vector with the given index
             * @param {number} column - column index of the vector
             * @return {MatrixColumnView}
             */
        columnView(column) {
          checkColumnIndex(this, column);
          return new MatrixColumnView(this, column);
        }

        /**
             * Returns a view of the matrix flipped in the row axis
             * @return {MatrixFlipRowView}
             */
        flipRowView() {
          return new MatrixFlipRowView(this);
        }

        /**
             * Returns a view of the matrix flipped in the column axis
             * @return {MatrixFlipColumnView}
             */
        flipColumnView() {
          return new MatrixFlipColumnView(this);
        }

        /**
             * Returns a view of a submatrix giving the index boundaries
             * @param {number} startRow - first row index of the submatrix
             * @param {number} endRow - last row index of the submatrix
             * @param {number} startColumn - first column index of the submatrix
             * @param {number} endColumn - last column index of the submatrix
             * @return {MatrixSubView}
             */
        subMatrixView(startRow, endRow, startColumn, endColumn) {
          return new MatrixSubView(this, startRow, endRow, startColumn, endColumn);
        }

        /**
             * Returns a view of the cross of the row indices and the column indices
             * @example
             * // resulting vector is [[2], [2]]
             * var matrix = new Matrix([[1,2,3], [4,5,6]]).selectionView([0, 0], [1])
             * @param {Array<number>} rowIndices
             * @param {Array<number>} columnIndices
             * @return {MatrixSelectionView}
             */
        selectionView(rowIndices, columnIndices) {
          return new MatrixSelectionView(this, rowIndices, columnIndices);
        }

        /**
             * Returns a view of the row indices
             * @example
             * // resulting vector is [[1,2,3], [1,2,3]]
             * var matrix = new Matrix([[1,2,3], [4,5,6]]).rowSelectionView([0, 0])
             * @param {Array<number>} rowIndices
             * @return {MatrixRowSelectionView}
             */
        rowSelectionView(rowIndices) {
          return new MatrixRowSelectionView(this, rowIndices);
        }

        /**
             * Returns a view of the column indices
             * @example
             * // resulting vector is [[2, 2], [5, 5]]
             * var matrix = new Matrix([[1,2,3], [4,5,6]]).columnSelectionView([1, 1])
             * @param {Array<number>} columnIndices
             * @return {MatrixColumnSelectionView}
             */
        columnSelectionView(columnIndices) {
          return new MatrixColumnSelectionView(this, columnIndices);
        }


        /**
            * Calculates and returns the determinant of a matrix as a Number
            * @example
            *   new Matrix([[1,2,3], [4,5,6]]).det()
            * @return {number}
            */
        det() {
          if (this.isSquare()) {
            var a, b, c, d;
            if (this.columns === 2) {
              // 2 x 2 matrix
              a = this.get(0, 0);
              b = this.get(0, 1);
              c = this.get(1, 0);
              d = this.get(1, 1);

              return a * d - (b * c);
            } else if (this.columns === 3) {
              // 3 x 3 matrix
              var subMatrix0, subMatrix1, subMatrix2;
              subMatrix0 = this.selectionView([1, 2], [1, 2]);
              subMatrix1 = this.selectionView([1, 2], [0, 2]);
              subMatrix2 = this.selectionView([1, 2], [0, 1]);
              a = this.get(0, 0);
              b = this.get(0, 1);
              c = this.get(0, 2);

              return a * subMatrix0.det() - b * subMatrix1.det() + c * subMatrix2.det();
            } else {
              // general purpose determinant using the LU decomposition
              return new LuDecomposition(this).determinant;
            }
          } else {
            throw Error('Determinant can only be calculated for a square matrix.');
          }
        }

        /**
             * Returns inverse of a matrix if it exists or the pseudoinverse
             * @param {number} threshold - threshold for taking inverse of singular values (default = 1e-15)
             * @return {Matrix} the (pseudo)inverted matrix.
             */
        pseudoInverse(threshold) {
          if (threshold === undefined) threshold = Number.EPSILON;
          var svdSolution = new SingularValueDecomposition(this, { autoTranspose: true });

          var U = svdSolution.leftSingularVectors;
          var V = svdSolution.rightSingularVectors;
          var s = svdSolution.diagonal;

          for (var i = 0; i < s.length; i++) {
            if (Math.abs(s[i]) > threshold) {
              s[i] = 1.0 / s[i];
            } else {
              s[i] = 0.0;
            }
          }

          // convert list to diagonal
          s = this.constructor[Symbol.species].diag(s);
          return V.mmul(s.mmul(U.transposeView()));
        }

        /**
             * Creates an exact and independent copy of the matrix
             * @return {Matrix}
             */
        clone() {
          var newMatrix = new this.constructor[Symbol.species](this.rows, this.columns);
          for (var row = 0; row < this.rows; row++) {
            for (var column = 0; column < this.columns; column++) {
              newMatrix.set(row, column, this.get(row, column));
            }
          }
          return newMatrix;
        }
      }

      Matrix.prototype.klass = 'Matrix';

      function compareNumbers(a, b) {
        return a - b;
      }

      /*
         Synonyms
         */

      Matrix.random = Matrix.rand;
      Matrix.diagonal = Matrix.diag;
      Matrix.prototype.diagonal = Matrix.prototype.diag;
      Matrix.identity = Matrix.eye;
      Matrix.prototype.negate = Matrix.prototype.neg;
      Matrix.prototype.tensorProduct = Matrix.prototype.kroneckerProduct;
      Matrix.prototype.determinant = Matrix.prototype.det;

      /*
         Add dynamically instance and static methods for mathematical operations
         */

      var inplaceOperator = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;

      var inplaceOperatorScalar = `
(function %name%S(value) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) %op% value);
        }
    }
    return this;
})
`;

      var inplaceOperatorMatrix = `
(function %name%M(matrix) {
    matrix = this.constructor.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) %op% matrix.get(i, j));
        }
    }
    return this;
})
`;

      var staticOperator = `
(function %name%(matrix, value) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%(value);
})
`;

      var inplaceMethod = `
(function %name%() {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j)));
        }
    }
    return this;
})
`;

      var staticMethod = `
(function %name%(matrix) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%();
})
`;

      var inplaceMethodWithArgs = `
(function %name%(%args%) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), %args%));
        }
    }
    return this;
})
`;

      var staticMethodWithArgs = `
(function %name%(matrix, %args%) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%(%args%);
})
`;


      var inplaceMethodWithOneArgScalar = `
(function %name%S(value) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), value));
        }
    }
    return this;
})
`;
      var inplaceMethodWithOneArgMatrix = `
(function %name%M(matrix) {
    matrix = this.constructor.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), matrix.get(i, j)));
        }
    }
    return this;
})
`;

      var inplaceMethodWithOneArg = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;

      var staticMethodWithOneArg = staticMethodWithArgs;

      var operators = [
        // Arithmetic operators
        ['+', 'add'],
        ['-', 'sub', 'subtract'],
        ['*', 'mul', 'multiply'],
        ['/', 'div', 'divide'],
        ['%', 'mod', 'modulus'],
        // Bitwise operators
        ['&', 'and'],
        ['|', 'or'],
        ['^', 'xor'],
        ['<<', 'leftShift'],
        ['>>', 'signPropagatingRightShift'],
        ['>>>', 'rightShift', 'zeroFillRightShift']
      ];

      var i;
      var eval2 = eval; // eslint-disable-line no-eval
      for (var operator of operators) {
        var inplaceOp = eval2(fillTemplateFunction(inplaceOperator, { name: operator[1], op: operator[0] }));
        var inplaceOpS = eval2(fillTemplateFunction(inplaceOperatorScalar, { name: `${operator[1]}S`, op: operator[0] }));
        var inplaceOpM = eval2(fillTemplateFunction(inplaceOperatorMatrix, { name: `${operator[1]}M`, op: operator[0] }));
        var staticOp = eval2(fillTemplateFunction(staticOperator, { name: operator[1] }));
        for (i = 1; i < operator.length; i++) {
          Matrix.prototype[operator[i]] = inplaceOp;
          Matrix.prototype[`${operator[i]}S`] = inplaceOpS;
          Matrix.prototype[`${operator[i]}M`] = inplaceOpM;
          Matrix[operator[i]] = staticOp;
        }
      }

      var methods = [['~', 'not']];

      [
        'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'cbrt', 'ceil',
        'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'log', 'log1p',
        'log10', 'log2', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'
      ].forEach(function (mathMethod) {
        methods.push([`Math.${mathMethod}`, mathMethod]);
      });

      for (var method of methods) {
        var inplaceMeth = eval2(fillTemplateFunction(inplaceMethod, { name: method[1], method: method[0] }));
        var staticMeth = eval2(fillTemplateFunction(staticMethod, { name: method[1] }));
        for (i = 1; i < method.length; i++) {
          Matrix.prototype[method[i]] = inplaceMeth;
          Matrix[method[i]] = staticMeth;
        }
      }

      var methodsWithArgs = [['Math.pow', 1, 'pow']];

      for (var methodWithArg of methodsWithArgs) {
        var args = 'arg0';
        for (i = 1; i < methodWithArg[1]; i++) {
          args += `, arg${i}`;
        }
        if (methodWithArg[1] !== 1) {
          var inplaceMethWithArgs = eval2(fillTemplateFunction(inplaceMethodWithArgs, {
            name: methodWithArg[2],
            method: methodWithArg[0],
            args: args
          }));
          var staticMethWithArgs = eval2(fillTemplateFunction(staticMethodWithArgs, { name: methodWithArg[2], args: args }));
          for (i = 2; i < methodWithArg.length; i++) {
            Matrix.prototype[methodWithArg[i]] = inplaceMethWithArgs;
            Matrix[methodWithArg[i]] = staticMethWithArgs;
          }
        } else {
          var tmplVar = {
            name: methodWithArg[2],
            args: args,
            method: methodWithArg[0]
          };
          var inplaceMethod2 = eval2(fillTemplateFunction(inplaceMethodWithOneArg, tmplVar));
          var inplaceMethodS = eval2(fillTemplateFunction(inplaceMethodWithOneArgScalar, tmplVar));
          var inplaceMethodM = eval2(fillTemplateFunction(inplaceMethodWithOneArgMatrix, tmplVar));
          var staticMethod2 = eval2(fillTemplateFunction(staticMethodWithOneArg, tmplVar));
          for (i = 2; i < methodWithArg.length; i++) {
            Matrix.prototype[methodWithArg[i]] = inplaceMethod2;
            Matrix.prototype[`${methodWithArg[i]}M`] = inplaceMethodM;
            Matrix.prototype[`${methodWithArg[i]}S`] = inplaceMethodS;
            Matrix[methodWithArg[i]] = staticMethod2;
          }
        }
      }

      function fillTemplateFunction(template, values) {
        for (var value in values) {
          template = template.replace(new RegExp(`%${value}%`, 'g'), values[value]);
        }
        return template;
      }

      return Matrix;
    }

    class Matrix extends AbstractMatrix(Array) {
      constructor(nRows, nColumns) {
        var i;
        if (arguments.length === 1 && typeof nRows === 'number') {
          return new Array(nRows);
        }
        if (Matrix.isMatrix(nRows)) {
          return nRows.clone();
        } else if (Number.isInteger(nRows) && nRows > 0) {
          // Create an empty matrix
          super(nRows);
          if (Number.isInteger(nColumns) && nColumns > 0) {
            for (i = 0; i < nRows; i++) {
              this[i] = new Array(nColumns);
            }
          } else {
            throw new TypeError('nColumns must be a positive integer');
          }
        } else if (Array.isArray(nRows)) {
          // Copy the values from the 2D array
          const matrix = nRows;
          nRows = matrix.length;
          nColumns = matrix[0].length;
          if (typeof nColumns !== 'number' || nColumns === 0) {
            throw new TypeError(
              'Data must be a 2D array with at least one element'
            );
          }
          super(nRows);
          for (i = 0; i < nRows; i++) {
            if (matrix[i].length !== nColumns) {
              throw new RangeError('Inconsistent array dimensions');
            }
            this[i] = [].concat(matrix[i]);
          }
        } else {
          throw new TypeError(
            'First argument must be a positive number or an array'
          );
        }
        this.rows = nRows;
        this.columns = nColumns;
        return this;
      }

      set(rowIndex, columnIndex, value) {
        this[rowIndex][columnIndex] = value;
        return this;
      }

      get(rowIndex, columnIndex) {
        return this[rowIndex][columnIndex];
      }

      /**
       * Removes a row from the given index
       * @param {number} index - Row index
       * @return {Matrix} this
       */
      removeRow(index) {
        checkRowIndex(this, index);
        if (this.rows === 1) {
          throw new RangeError('A matrix cannot have less than one row');
        }
        this.splice(index, 1);
        this.rows -= 1;
        return this;
      }

      /**
       * Adds a row at the given index
       * @param {number} [index = this.rows] - Row index
       * @param {Array|Matrix} array - Array or vector
       * @return {Matrix} this
       */
      addRow(index, array) {
        if (array === undefined) {
          array = index;
          index = this.rows;
        }
        checkRowIndex(this, index, true);
        array = checkRowVector(this, array);
        this.splice(index, 0, array);
        this.rows += 1;
        return this;
      }

      /**
       * Removes a column from the given index
       * @param {number} index - Column index
       * @return {Matrix} this
       */
      removeColumn(index) {
        checkColumnIndex(this, index);
        if (this.columns === 1) {
          throw new RangeError('A matrix cannot have less than one column');
        }
        for (var i = 0; i < this.rows; i++) {
          this[i].splice(index, 1);
        }
        this.columns -= 1;
        return this;
      }

      /**
       * Adds a column at the given index
       * @param {number} [index = this.columns] - Column index
       * @param {Array|Matrix} array - Array or vector
       * @return {Matrix} this
       */
      addColumn(index, array) {
        if (typeof array === 'undefined') {
          array = index;
          index = this.columns;
        }
        checkColumnIndex(this, index, true);
        array = checkColumnVector(this, array);
        for (var i = 0; i < this.rows; i++) {
          this[i].splice(index, 0, array[i]);
        }
        this.columns += 1;
        return this;
      }
    }

    class WrapperMatrix1D extends AbstractMatrix() {
      /**
       * @class WrapperMatrix1D
       * @param {Array<number>} data
       * @param {object} [options]
       * @param {object} [options.rows = 1]
       */
      constructor(data, options = {}) {
        const { rows = 1 } = options;

        if (data.length % rows !== 0) {
          throw new Error('the data length is not divisible by the number of rows');
        }
        super();
        this.rows = rows;
        this.columns = data.length / rows;
        this.data = data;
      }

      set(rowIndex, columnIndex, value) {
        var index = this._calculateIndex(rowIndex, columnIndex);
        this.data[index] = value;
        return this;
      }

      get(rowIndex, columnIndex) {
        var index = this._calculateIndex(rowIndex, columnIndex);
        return this.data[index];
      }

      _calculateIndex(row, column) {
        return row * this.columns + column;
      }

      static get [Symbol.species]() {
        return Matrix;
      }
    }

    class WrapperMatrix2D extends AbstractMatrix() {
      /**
       * @class WrapperMatrix2D
       * @param {Array<Array<number>>} data
       */
      constructor(data) {
        super();
        this.data = data;
        this.rows = data.length;
        this.columns = data[0].length;
      }

      set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
      }

      get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
      }

      static get [Symbol.species]() {
        return Matrix;
      }
    }

    /**
     * @class QrDecomposition
     * @link https://github.com/lutzroeder/Mapack/blob/master/Source/QrDecomposition.cs
     * @param {Matrix} value
     */
    class QrDecomposition {
      constructor(value) {
        value = WrapperMatrix2D.checkMatrix(value);

        var qr = value.clone();
        var m = value.rows;
        var n = value.columns;
        var rdiag = new Array(n);
        var i, j, k, s;

        for (k = 0; k < n; k++) {
          var nrm = 0;
          for (i = k; i < m; i++) {
            nrm = hypotenuse(nrm, qr.get(i, k));
          }
          if (nrm !== 0) {
            if (qr.get(k, k) < 0) {
              nrm = -nrm;
            }
            for (i = k; i < m; i++) {
              qr.set(i, k, qr.get(i, k) / nrm);
            }
            qr.set(k, k, qr.get(k, k) + 1);
            for (j = k + 1; j < n; j++) {
              s = 0;
              for (i = k; i < m; i++) {
                s += qr.get(i, k) * qr.get(i, j);
              }
              s = -s / qr.get(k, k);
              for (i = k; i < m; i++) {
                qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
              }
            }
          }
          rdiag[k] = -nrm;
        }

        this.QR = qr;
        this.Rdiag = rdiag;
      }

      /**
       * Solve a problem of least square (Ax=b) by using the QR decomposition. Useful when A is rectangular, but not working when A is singular.
       * Example : We search to approximate x, with A matrix shape m*n, x vector size n, b vector size m (m > n). We will use :
       * var qr = QrDecomposition(A);
       * var x = qr.solve(b);
       * @param {Matrix} value - Matrix 1D which is the vector b (in the equation Ax = b)
       * @return {Matrix} - The vector x
       */
      solve(value) {
        value = Matrix.checkMatrix(value);

        var qr = this.QR;
        var m = qr.rows;

        if (value.rows !== m) {
          throw new Error('Matrix row dimensions must agree');
        }
        if (!this.isFullRank()) {
          throw new Error('Matrix is rank deficient');
        }

        var count = value.columns;
        var X = value.clone();
        var n = qr.columns;
        var i, j, k, s;

        for (k = 0; k < n; k++) {
          for (j = 0; j < count; j++) {
            s = 0;
            for (i = k; i < m; i++) {
              s += qr[i][k] * X[i][j];
            }
            s = -s / qr[k][k];
            for (i = k; i < m; i++) {
              X[i][j] += s * qr[i][k];
            }
          }
        }
        for (k = n - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            X[k][j] /= this.Rdiag[k];
          }
          for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) {
              X[i][j] -= X[k][j] * qr[i][k];
            }
          }
        }

        return X.subMatrix(0, n - 1, 0, count - 1);
      }

      /**
       *
       * @return {boolean}
       */
      isFullRank() {
        var columns = this.QR.columns;
        for (var i = 0; i < columns; i++) {
          if (this.Rdiag[i] === 0) {
            return false;
          }
        }
        return true;
      }

      /**
       *
       * @return {Matrix}
       */
      get upperTriangularMatrix() {
        var qr = this.QR;
        var n = qr.columns;
        var X = new Matrix(n, n);
        var i, j;
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            if (i < j) {
              X[i][j] = qr[i][j];
            } else if (i === j) {
              X[i][j] = this.Rdiag[i];
            } else {
              X[i][j] = 0;
            }
          }
        }
        return X;
      }

      /**
       *
       * @return {Matrix}
       */
      get orthogonalMatrix() {
        var qr = this.QR;
        var rows = qr.rows;
        var columns = qr.columns;
        var X = new Matrix(rows, columns);
        var i, j, k, s;

        for (k = columns - 1; k >= 0; k--) {
          for (i = 0; i < rows; i++) {
            X[i][k] = 0;
          }
          X[k][k] = 1;
          for (j = k; j < columns; j++) {
            if (qr[k][k] !== 0) {
              s = 0;
              for (i = k; i < rows; i++) {
                s += qr[i][k] * X[i][j];
              }

              s = -s / qr[k][k];

              for (i = k; i < rows; i++) {
                X[i][j] += s * qr[i][k];
              }
            }
          }
        }
        return X;
      }
    }

    /**
     * Computes the inverse of a Matrix
     * @param {Matrix} matrix
     * @param {boolean} [useSVD=false]
     * @return {Matrix}
     */
    function inverse(matrix, useSVD = false) {
      matrix = WrapperMatrix2D.checkMatrix(matrix);
      if (useSVD) {
        return new SingularValueDecomposition(matrix).inverse();
      } else {
        return solve(matrix, Matrix.eye(matrix.rows));
      }
    }

    /**
     *
     * @param {Matrix} leftHandSide
     * @param {Matrix} rightHandSide
     * @param {boolean} [useSVD = false]
     * @return {Matrix}
     */
    function solve(leftHandSide, rightHandSide, useSVD = false) {
      leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
      rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
      if (useSVD) {
        return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
      } else {
        return leftHandSide.isSquare()
          ? new LuDecomposition(leftHandSide).solve(rightHandSide)
          : new QrDecomposition(leftHandSide).solve(rightHandSide);
      }
    }

    /**
     * Difference of the matrix function over the parameters
     * @ignore
     * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
     * @param {Array<number>} evaluatedData - Array of previous evaluated function values
     * @param {Array<number>} params - Array of previous parameter values
     * @param {number} gradientDifference - Adjustment for decrease the damping parameter
     * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
     * @return {Matrix}
     */
    function gradientFunction(
      data,
      evaluatedData,
      params,
      gradientDifference,
      paramFunction
    ) {
      const n = params.length;
      const m = data.x.length;

      var ans = new Array(n);

      for (var param = 0; param < n; param++) {
        ans[param] = new Array(m);
        var auxParams = params.concat();
        auxParams[param] += gradientDifference;
        var funcParam = paramFunction(auxParams);

        for (var point = 0; point < m; point++) {
          ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
        }
      }
      return new Matrix(ans);
    }

    /**
     * Matrix function over the samples
     * @ignore
     * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
     * @param {Array<number>} evaluatedData - Array of previous evaluated function values
     * @return {Matrix}
     */
    function matrixFunction(data, evaluatedData) {
      const m = data.x.length;

      var ans = new Array(m);

      for (var point = 0; point < m; point++) {
        ans[point] = [data.y[point] - evaluatedData[point]];
      }

      return new Matrix(ans);
    }

    /**
     * Iteration for Levenberg-Marquardt
     * @ignore
     * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
     * @param {Array<number>} params - Array of previous parameter values
     * @param {number} damping - Levenberg-Marquardt parameter
     * @param {number} gradientDifference - Adjustment for decrease the damping parameter
     * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
     * @return {Array<number>}
     */
    function step(
      data,
      params,
      damping,
      gradientDifference,
      parameterizedFunction
    ) {
      var value = damping * gradientDifference * gradientDifference;
      var identity = Matrix.eye(params.length, params.length, value);

      const func = parameterizedFunction(params);
      var evaluatedData = data.x.map((e) => func(e));

      var gradientFunc = gradientFunction(
        data,
        evaluatedData,
        params,
        gradientDifference,
        parameterizedFunction
      );
      var matrixFunc = matrixFunction(data, evaluatedData);
      var inverseMatrix = inverse(
        identity.add(gradientFunc.mmul(gradientFunc.transpose()))
      );

      params = new Matrix([params]);
      params = params.sub(
        inverseMatrix
          .mmul(gradientFunc)
          .mmul(matrixFunc)
          .mul(gradientDifference)
          .transpose()
      );

      return params.to1DArray();
    }

    /**
     * Curve fitting algorithm
     * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
     * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
     * @param {object} [options] - Options object
     * @param {number} [options.damping] - Levenberg-Marquardt parameter
     * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
     * @param {Array<number>} [options.minValues] - Minimum allowed values for parameters
     * @param {Array<number>} [options.maxValues] - Maximum allowed values for parameters
     * @param {Array<number>} [options.initialValues] - Array of initial parameter values
     * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
     * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
     * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
     */
    function levenbergMarquardt(
      data,
      parameterizedFunction,
      options = {}
    ) {
      let {
        maxIterations = 100,
        gradientDifference = 10e-2,
        damping = 0,
        errorTolerance = 10e-3,
        minValues,
        maxValues,
        initialValues
      } = options;

      if (damping <= 0) {
        throw new Error('The damping option must be a positive number');
      } else if (!data.x || !data.y) {
        throw new Error('The data parameter must have x and y elements');
      } else if (
        !Array.isArray(data.x) ||
        data.x.length < 2 ||
        !Array.isArray(data.y) ||
        data.y.length < 2
      ) {
        throw new Error(
          'The data parameter elements must be an array with more than 2 points'
        );
      } else if (data.x.length !== data.y.length) {
        throw new Error('The data parameter elements must have the same size');
      }

      var parameters =
        initialValues || new Array(parameterizedFunction.length).fill(1);
      let parLen = parameters.length;
      maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
      minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

      if (maxValues.length !== minValues.length) {
        throw new Error('minValues and maxValues must be the same size');
      }

      if (!Array.isArray(parameters)) {
        throw new Error('initialValues must be an array');
      }

      var error = errorCalculation(data, parameters, parameterizedFunction);

      var converged = error <= errorTolerance;

      for (
        var iteration = 0;
        iteration < maxIterations && !converged;
        iteration++
      ) {
        parameters = step(
          data,
          parameters,
          damping,
          gradientDifference,
          parameterizedFunction
        );

        for (let k = 0; k < parLen; k++) {
          parameters[k] = Math.min(
            Math.max(minValues[k], parameters[k]),
            maxValues[k]
          );
        }

        error = errorCalculation(data, parameters, parameterizedFunction);
        if (isNaN(error)) break;
        converged = error <= errorTolerance;
      }

      return {
        parameterValues: parameters,
        parameterError: error,
        iterations: iteration
      };
    }

    var umap = createCommonjsModule(function (module, exports) {
    var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spread = (commonjsGlobal && commonjsGlobal.__spread) || function () {
        for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
        return ar;
    };
    var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var heap$1 = __importStar(heap);
    var matrix$1 = __importStar(matrix);
    var nnDescent = __importStar(nn_descent);
    var tree$1 = __importStar(tree);
    var utils$1 = __importStar(utils);
    var ml_levenberg_marquardt_1 = __importDefault(levenbergMarquardt);
    var SMOOTH_K_TOLERANCE = 1e-5;
    var MIN_K_DIST_SCALE = 1e-3;
    var UMAP = (function () {
        function UMAP(params) {
            if (params === void 0) { params = {}; }
            var _this = this;
            this.learningRate = 1.0;
            this.localConnectivity = 1.0;
            this.minDist = 0.1;
            this.nComponents = 2;
            this.nEpochs = 0;
            this.nNeighbors = 15;
            this.negativeSampleRate = 5;
            this.random = Math.random;
            this.repulsionStrength = 1.0;
            this.setOpMixRatio = 1.0;
            this.spread = 1.0;
            this.transformQueueSize = 4.0;
            this.targetMetric = "categorical";
            this.targetWeight = 0.5;
            this.targetNNeighbors = this.nNeighbors;
            this.distanceFn = euclidean;
            this.isInitialized = false;
            this.rpForest = [];
            this.embedding = [];
            this.optimizationState = new OptimizationState();
            var setParam = function (key) {
                if (params[key] !== undefined)
                    _this[key] = params[key];
            };
            setParam('distanceFn');
            setParam('learningRate');
            setParam('localConnectivity');
            setParam('minDist');
            setParam('nComponents');
            setParam('nEpochs');
            setParam('nNeighbors');
            setParam('negativeSampleRate');
            setParam('random');
            setParam('repulsionStrength');
            setParam('setOpMixRatio');
            setParam('spread');
            setParam('transformQueueSize');
        }
        UMAP.prototype.fit = function (X) {
            this.initializeFit(X);
            this.optimizeLayout();
            return this.embedding;
        };
        UMAP.prototype.fitAsync = function (X, callback) {
            if (callback === void 0) { callback = function () { return true; }; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.initializeFit(X);
                            return [4, this.optimizeLayoutAsync(callback)];
                        case 1:
                            _a.sent();
                            return [2, this.embedding];
                    }
                });
            });
        };
        UMAP.prototype.setSupervisedProjection = function (Y, params) {
            if (params === void 0) { params = {}; }
            this.Y = Y;
            this.targetMetric = params.targetMetric || this.targetMetric;
            this.targetWeight = params.targetWeight || this.targetWeight;
            this.targetNNeighbors = params.targetNNeighbors || this.targetNNeighbors;
        };
        UMAP.prototype.setPrecomputedKNN = function (knnIndices, knnDistances) {
            this.knnIndices = knnIndices;
            this.knnDistances = knnDistances;
        };
        UMAP.prototype.initializeFit = function (X) {
            if (this.X === X && this.isInitialized) {
                return this.getNEpochs();
            }
            this.X = X;
            if (!this.knnIndices && !this.knnDistances) {
                var knnResults = this.nearestNeighbors(X);
                this.knnIndices = knnResults.knnIndices;
                this.knnDistances = knnResults.knnDistances;
            }
            this.graph = this.fuzzySimplicialSet(X, this.nNeighbors, this.setOpMixRatio);
            this.makeSearchFns();
            this.searchGraph = this.makeSearchGraph(X);
            this.processGraphForSupervisedProjection();
            var _a = this.initializeSimplicialSetEmbedding(), head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
            this.optimizationState.head = head;
            this.optimizationState.tail = tail;
            this.optimizationState.epochsPerSample = epochsPerSample;
            this.initializeOptimization();
            this.prepareForOptimizationLoop();
            this.isInitialized = true;
            return this.getNEpochs();
        };
        UMAP.prototype.makeSearchFns = function () {
            var _a = nnDescent.makeInitializations(this.distanceFn), initFromTree = _a.initFromTree, initFromRandom = _a.initFromRandom;
            this.initFromTree = initFromTree;
            this.initFromRandom = initFromRandom;
            this.search = nnDescent.makeInitializedNNSearch(this.distanceFn);
        };
        UMAP.prototype.makeSearchGraph = function (X) {
            var knnIndices = this.knnIndices;
            var knnDistances = this.knnDistances;
            var dims = [X.length, X.length];
            var searchGraph = new matrix$1.SparseMatrix([], [], [], dims);
            for (var i = 0; i < knnIndices.length; i++) {
                var knn = knnIndices[i];
                var distances = knnDistances[i];
                for (var j = 0; j < knn.length; j++) {
                    var neighbor = knn[j];
                    var distance = distances[j];
                    if (distance > 0) {
                        searchGraph.set(i, neighbor, distance);
                    }
                }
            }
            var transpose = matrix$1.transpose(searchGraph);
            return matrix$1.maximum(searchGraph, transpose);
        };
        UMAP.prototype.transform = function (toTransform) {
            var _this = this;
            var rawData = this.X;
            if (rawData === undefined || rawData.length === 0) {
                throw new Error('No data has been fit.');
            }
            var nNeighbors = Math.floor(this.nNeighbors * this.transformQueueSize);
            var init = nnDescent.initializeSearch(this.rpForest, rawData, toTransform, nNeighbors, this.initFromRandom, this.initFromTree, this.random);
            var result = this.search(rawData, this.searchGraph, init, toTransform);
            var _a = heap$1.deheapSort(result), indices = _a.indices, distances = _a.weights;
            indices = indices.map(function (x) { return x.slice(0, _this.nNeighbors); });
            distances = distances.map(function (x) { return x.slice(0, _this.nNeighbors); });
            var adjustedLocalConnectivity = Math.max(0, this.localConnectivity - 1);
            var _b = this.smoothKNNDistance(distances, this.nNeighbors, adjustedLocalConnectivity), sigmas = _b.sigmas, rhos = _b.rhos;
            var _c = this.computeMembershipStrengths(indices, distances, sigmas, rhos), rows = _c.rows, cols = _c.cols, vals = _c.vals;
            var size = [toTransform.length, rawData.length];
            var graph = new matrix$1.SparseMatrix(rows, cols, vals, size);
            var normed = matrix$1.normalize(graph, "l1");
            var csrMatrix = matrix$1.getCSR(normed);
            var nPoints = toTransform.length;
            var eIndices = utils$1.reshape2d(csrMatrix.indices, nPoints, this.nNeighbors);
            var eWeights = utils$1.reshape2d(csrMatrix.values, nPoints, this.nNeighbors);
            var embedding = initTransform(eIndices, eWeights, this.embedding);
            var nEpochs = this.nEpochs
                ? this.nEpochs / 3
                : graph.nRows <= 10000
                    ? 100
                    : 30;
            var graphMax = graph
                .getValues()
                .reduce(function (max, val) { return (val > max ? val : max); }, 0);
            graph = graph.map(function (value) { return (value < graphMax / nEpochs ? 0 : value); });
            graph = matrix$1.eliminateZeros(graph);
            var epochsPerSample = this.makeEpochsPerSample(graph.getValues(), nEpochs);
            var head = graph.getRows();
            var tail = graph.getCols();
            this.assignOptimizationStateParameters({
                headEmbedding: embedding,
                tailEmbedding: this.embedding,
                head: head,
                tail: tail,
                currentEpoch: 0,
                nEpochs: nEpochs,
                nVertices: graph.getDims()[1],
                epochsPerSample: epochsPerSample,
            });
            this.prepareForOptimizationLoop();
            return this.optimizeLayout();
        };
        UMAP.prototype.processGraphForSupervisedProjection = function () {
            var _a = this, Y = _a.Y, X = _a.X;
            if (Y) {
                if (Y.length !== X.length) {
                    throw new Error('Length of X and y must be equal');
                }
                if (this.targetMetric === "categorical") {
                    var lt = this.targetWeight < 1.0;
                    var farDist = lt ? 2.5 * (1.0 / (1.0 - this.targetWeight)) : 1.0e12;
                    this.graph = this.categoricalSimplicialSetIntersection(this.graph, Y, farDist);
                }
            }
        };
        UMAP.prototype.step = function () {
            var currentEpoch = this.optimizationState.currentEpoch;
            if (currentEpoch < this.getNEpochs()) {
                this.optimizeLayoutStep(currentEpoch);
            }
            return this.optimizationState.currentEpoch;
        };
        UMAP.prototype.getEmbedding = function () {
            return this.embedding;
        };
        UMAP.prototype.nearestNeighbors = function (X) {
            var _a = this, distanceFn = _a.distanceFn, nNeighbors = _a.nNeighbors;
            var log2 = function (n) { return Math.log(n) / Math.log(2); };
            var metricNNDescent = nnDescent.makeNNDescent(distanceFn, this.random);
            var round = function (n) {
                return n === 0.5 ? 0 : Math.round(n);
            };
            var nTrees = 5 + Math.floor(round(Math.pow(X.length, 0.5) / 20.0));
            var nIters = Math.max(5, Math.floor(Math.round(log2(X.length))));
            this.rpForest = tree$1.makeForest(X, nNeighbors, nTrees, this.random);
            var leafArray = tree$1.makeLeafArray(this.rpForest);
            var _b = metricNNDescent(X, leafArray, nNeighbors, nIters), indices = _b.indices, weights = _b.weights;
            return { knnIndices: indices, knnDistances: weights };
        };
        UMAP.prototype.fuzzySimplicialSet = function (X, nNeighbors, setOpMixRatio) {
            if (setOpMixRatio === void 0) { setOpMixRatio = 1.0; }
            var _a = this, _b = _a.knnIndices, knnIndices = _b === void 0 ? [] : _b, _c = _a.knnDistances, knnDistances = _c === void 0 ? [] : _c, localConnectivity = _a.localConnectivity;
            var _d = this.smoothKNNDistance(knnDistances, nNeighbors, localConnectivity), sigmas = _d.sigmas, rhos = _d.rhos;
            var _e = this.computeMembershipStrengths(knnIndices, knnDistances, sigmas, rhos), rows = _e.rows, cols = _e.cols, vals = _e.vals;
            var size = [X.length, X.length];
            var sparseMatrix = new matrix$1.SparseMatrix(rows, cols, vals, size);
            var transpose = matrix$1.transpose(sparseMatrix);
            var prodMatrix = matrix$1.pairwiseMultiply(sparseMatrix, transpose);
            var a = matrix$1.subtract(matrix$1.add(sparseMatrix, transpose), prodMatrix);
            var b = matrix$1.multiplyScalar(a, setOpMixRatio);
            var c = matrix$1.multiplyScalar(prodMatrix, 1.0 - setOpMixRatio);
            var result = matrix$1.add(b, c);
            return result;
        };
        UMAP.prototype.categoricalSimplicialSetIntersection = function (simplicialSet, target, farDist, unknownDist) {
            if (unknownDist === void 0) { unknownDist = 1.0; }
            var intersection = fastIntersection(simplicialSet, target, unknownDist, farDist);
            intersection = matrix$1.eliminateZeros(intersection);
            return resetLocalConnectivity(intersection);
        };
        UMAP.prototype.smoothKNNDistance = function (distances, k, localConnectivity, nIter, bandwidth) {
            if (localConnectivity === void 0) { localConnectivity = 1.0; }
            if (nIter === void 0) { nIter = 64; }
            if (bandwidth === void 0) { bandwidth = 1.0; }
            var target = (Math.log(k) / Math.log(2)) * bandwidth;
            var rho = utils$1.zeros(distances.length);
            var result = utils$1.zeros(distances.length);
            for (var i = 0; i < distances.length; i++) {
                var lo = 0.0;
                var hi = Infinity;
                var mid = 1.0;
                var ithDistances = distances[i];
                var nonZeroDists = ithDistances.filter(function (d) { return d > 0.0; });
                if (nonZeroDists.length >= localConnectivity) {
                    var index = Math.floor(localConnectivity);
                    var interpolation = localConnectivity - index;
                    if (index > 0) {
                        rho[i] = nonZeroDists[index - 1];
                        if (interpolation > SMOOTH_K_TOLERANCE) {
                            rho[i] +=
                                interpolation * (nonZeroDists[index] - nonZeroDists[index - 1]);
                        }
                    }
                    else {
                        rho[i] = interpolation * nonZeroDists[0];
                    }
                }
                else if (nonZeroDists.length > 0) {
                    rho[i] = utils$1.max(nonZeroDists);
                }
                for (var n = 0; n < nIter; n++) {
                    var psum = 0.0;
                    for (var j = 1; j < distances[i].length; j++) {
                        var d = distances[i][j] - rho[i];
                        if (d > 0) {
                            psum += Math.exp(-(d / mid));
                        }
                        else {
                            psum += 1.0;
                        }
                    }
                    if (Math.abs(psum - target) < SMOOTH_K_TOLERANCE) {
                        break;
                    }
                    if (psum > target) {
                        hi = mid;
                        mid = (lo + hi) / 2.0;
                    }
                    else {
                        lo = mid;
                        if (hi === Infinity) {
                            mid *= 2;
                        }
                        else {
                            mid = (lo + hi) / 2.0;
                        }
                    }
                }
                result[i] = mid;
                if (rho[i] > 0.0) {
                    var meanIthDistances = utils$1.mean(ithDistances);
                    if (result[i] < MIN_K_DIST_SCALE * meanIthDistances) {
                        result[i] = MIN_K_DIST_SCALE * meanIthDistances;
                    }
                }
                else {
                    var meanDistances = utils$1.mean(distances.map(utils$1.mean));
                    if (result[i] < MIN_K_DIST_SCALE * meanDistances) {
                        result[i] = MIN_K_DIST_SCALE * meanDistances;
                    }
                }
            }
            return { sigmas: result, rhos: rho };
        };
        UMAP.prototype.computeMembershipStrengths = function (knnIndices, knnDistances, sigmas, rhos) {
            var nSamples = knnIndices.length;
            var nNeighbors = knnIndices[0].length;
            var rows = utils$1.zeros(nSamples * nNeighbors);
            var cols = utils$1.zeros(nSamples * nNeighbors);
            var vals = utils$1.zeros(nSamples * nNeighbors);
            for (var i = 0; i < nSamples; i++) {
                for (var j = 0; j < nNeighbors; j++) {
                    var val = 0;
                    if (knnIndices[i][j] === -1) {
                        continue;
                    }
                    if (knnIndices[i][j] === i) {
                        val = 0.0;
                    }
                    else if (knnDistances[i][j] - rhos[i] <= 0.0) {
                        val = 1.0;
                    }
                    else {
                        val = Math.exp(-((knnDistances[i][j] - rhos[i]) / sigmas[i]));
                    }
                    rows[i * nNeighbors + j] = i;
                    cols[i * nNeighbors + j] = knnIndices[i][j];
                    vals[i * nNeighbors + j] = val;
                }
            }
            return { rows: rows, cols: cols, vals: vals };
        };
        UMAP.prototype.initializeSimplicialSetEmbedding = function () {
            var _this = this;
            var nEpochs = this.getNEpochs();
            var nComponents = this.nComponents;
            var graphValues = this.graph.getValues();
            var graphMax = 0;
            for (var i = 0; i < graphValues.length; i++) {
                var value = graphValues[i];
                if (graphMax < graphValues[i]) {
                    graphMax = value;
                }
            }
            var graph = this.graph.map(function (value) {
                if (value < graphMax / nEpochs) {
                    return 0;
                }
                else {
                    return value;
                }
            });
            this.embedding = utils$1.zeros(graph.nRows).map(function () {
                return utils$1.zeros(nComponents).map(function () {
                    return utils$1.tauRand(_this.random) * 20 + -10;
                });
            });
            var weights = [];
            var head = [];
            var tail = [];
            for (var i = 0; i < graph.nRows; i++) {
                for (var j = 0; j < graph.nCols; j++) {
                    var value = graph.get(i, j);
                    if (value) {
                        weights.push(value);
                        tail.push(i);
                        head.push(j);
                    }
                }
            }
            var epochsPerSample = this.makeEpochsPerSample(weights, nEpochs);
            return { head: head, tail: tail, epochsPerSample: epochsPerSample };
        };
        UMAP.prototype.makeEpochsPerSample = function (weights, nEpochs) {
            var result = utils$1.filled(weights.length, -1.0);
            var max = utils$1.max(weights);
            var nSamples = weights.map(function (w) { return (w / max) * nEpochs; });
            nSamples.forEach(function (n, i) {
                if (n > 0)
                    result[i] = nEpochs / nSamples[i];
            });
            return result;
        };
        UMAP.prototype.assignOptimizationStateParameters = function (state) {
            Object.assign(this.optimizationState, state);
        };
        UMAP.prototype.prepareForOptimizationLoop = function () {
            var _a = this, repulsionStrength = _a.repulsionStrength, learningRate = _a.learningRate, negativeSampleRate = _a.negativeSampleRate;
            var _b = this.optimizationState, epochsPerSample = _b.epochsPerSample, headEmbedding = _b.headEmbedding, tailEmbedding = _b.tailEmbedding;
            var dim = headEmbedding[0].length;
            var moveOther = headEmbedding.length === tailEmbedding.length;
            var epochsPerNegativeSample = epochsPerSample.map(function (e) { return e / negativeSampleRate; });
            var epochOfNextNegativeSample = __spread(epochsPerNegativeSample);
            var epochOfNextSample = __spread(epochsPerSample);
            this.assignOptimizationStateParameters({
                epochOfNextSample: epochOfNextSample,
                epochOfNextNegativeSample: epochOfNextNegativeSample,
                epochsPerNegativeSample: epochsPerNegativeSample,
                moveOther: moveOther,
                initialAlpha: learningRate,
                alpha: learningRate,
                gamma: repulsionStrength,
                dim: dim,
            });
        };
        UMAP.prototype.initializeOptimization = function () {
            var headEmbedding = this.embedding;
            var tailEmbedding = this.embedding;
            var _a = this.optimizationState, head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
            var nEpochs = this.getNEpochs();
            var nVertices = this.graph.nCols;
            var _b = findABParams(this.spread, this.minDist), a = _b.a, b = _b.b;
            this.assignOptimizationStateParameters({
                headEmbedding: headEmbedding,
                tailEmbedding: tailEmbedding,
                head: head,
                tail: tail,
                epochsPerSample: epochsPerSample,
                a: a,
                b: b,
                nEpochs: nEpochs,
                nVertices: nVertices,
            });
        };
        UMAP.prototype.optimizeLayoutStep = function (n) {
            var optimizationState = this.optimizationState;
            var head = optimizationState.head, tail = optimizationState.tail, headEmbedding = optimizationState.headEmbedding, tailEmbedding = optimizationState.tailEmbedding, epochsPerSample = optimizationState.epochsPerSample, epochOfNextSample = optimizationState.epochOfNextSample, epochOfNextNegativeSample = optimizationState.epochOfNextNegativeSample, epochsPerNegativeSample = optimizationState.epochsPerNegativeSample, moveOther = optimizationState.moveOther, initialAlpha = optimizationState.initialAlpha, alpha = optimizationState.alpha, gamma = optimizationState.gamma, a = optimizationState.a, b = optimizationState.b, dim = optimizationState.dim, nEpochs = optimizationState.nEpochs, nVertices = optimizationState.nVertices;
            var clipValue = 4.0;
            for (var i = 0; i < epochsPerSample.length; i++) {
                if (epochOfNextSample[i] > n) {
                    continue;
                }
                var j = head[i];
                var k = tail[i];
                var current = headEmbedding[j];
                var other = tailEmbedding[k];
                var distSquared = rDist(current, other);
                var gradCoeff = 0;
                if (distSquared > 0) {
                    gradCoeff = -2.0 * a * b * Math.pow(distSquared, b - 1.0);
                    gradCoeff /= a * Math.pow(distSquared, b) + 1.0;
                }
                for (var d = 0; d < dim; d++) {
                    var gradD = clip(gradCoeff * (current[d] - other[d]), clipValue);
                    current[d] += gradD * alpha;
                    if (moveOther) {
                        other[d] += -gradD * alpha;
                    }
                }
                epochOfNextSample[i] += epochsPerSample[i];
                var nNegSamples = Math.floor((n - epochOfNextNegativeSample[i]) / epochsPerNegativeSample[i]);
                for (var p = 0; p < nNegSamples; p++) {
                    var k_1 = utils$1.tauRandInt(nVertices, this.random);
                    var other_1 = tailEmbedding[k_1];
                    var distSquared_1 = rDist(current, other_1);
                    var gradCoeff_1 = 0.0;
                    if (distSquared_1 > 0.0) {
                        gradCoeff_1 = 2.0 * gamma * b;
                        gradCoeff_1 /=
                            (0.001 + distSquared_1) * (a * Math.pow(distSquared_1, b) + 1);
                    }
                    else if (j === k_1) {
                        continue;
                    }
                    for (var d = 0; d < dim; d++) {
                        var gradD = 4.0;
                        if (gradCoeff_1 > 0.0) {
                            gradD = clip(gradCoeff_1 * (current[d] - other_1[d]), clipValue);
                        }
                        current[d] += gradD * alpha;
                    }
                }
                epochOfNextNegativeSample[i] += nNegSamples * epochsPerNegativeSample[i];
            }
            optimizationState.alpha = initialAlpha * (1.0 - n / nEpochs);
            optimizationState.currentEpoch += 1;
            return headEmbedding;
        };
        UMAP.prototype.optimizeLayoutAsync = function (epochCallback) {
            var _this = this;
            if (epochCallback === void 0) { epochCallback = function () { return true; }; }
            return new Promise(function (resolve, reject) {
                var step = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, nEpochs, currentEpoch, epochCompleted, shouldStop, isFinished;
                    return __generator(this, function (_b) {
                        try {
                            _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
                            this.embedding = this.optimizeLayoutStep(currentEpoch);
                            epochCompleted = this.optimizationState.currentEpoch;
                            shouldStop = epochCallback(epochCompleted) === false;
                            isFinished = epochCompleted === nEpochs;
                            if (!shouldStop && !isFinished) {
                                step();
                            }
                            else {
                                return [2, resolve(isFinished)];
                            }
                        }
                        catch (err) {
                            reject(err);
                        }
                        return [2];
                    });
                }); };
                step();
            });
        };
        UMAP.prototype.optimizeLayout = function (epochCallback) {
            if (epochCallback === void 0) { epochCallback = function () { return true; }; }
            var isFinished = false;
            var embedding = [];
            while (!isFinished) {
                var _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
                embedding = this.optimizeLayoutStep(currentEpoch);
                var epochCompleted = this.optimizationState.currentEpoch;
                var shouldStop = epochCallback(epochCompleted) === false;
                isFinished = epochCompleted === nEpochs || shouldStop;
            }
            return embedding;
        };
        UMAP.prototype.getNEpochs = function () {
            var graph = this.graph;
            if (this.nEpochs > 0) {
                return this.nEpochs;
            }
            var length = graph.nRows;
            if (length <= 2500) {
                return 500;
            }
            else if (length <= 5000) {
                return 400;
            }
            else if (length <= 7500) {
                return 300;
            }
            else {
                return 200;
            }
        };
        return UMAP;
    }());
    exports.UMAP = UMAP;
    function euclidean(x, y) {
        var result = 0;
        for (var i = 0; i < x.length; i++) {
            result += Math.pow((x[i] - y[i]), 2);
        }
        return Math.sqrt(result);
    }
    exports.euclidean = euclidean;
    function cosine(x, y) {
        var result = 0.0;
        var normX = 0.0;
        var normY = 0.0;
        for (var i = 0; i < x.length; i++) {
            result += x[i] * y[i];
            normX += Math.pow(x[i], 2);
            normY += Math.pow(y[i], 2);
        }
        if (normX === 0 && normY === 0) {
            return 0;
        }
        else if (normX === 0 || normY === 0) {
            return 1.0;
        }
        else {
            return 1.0 - result / Math.sqrt(normX * normY);
        }
    }
    exports.cosine = cosine;
    var OptimizationState = (function () {
        function OptimizationState() {
            this.currentEpoch = 0;
            this.headEmbedding = [];
            this.tailEmbedding = [];
            this.head = [];
            this.tail = [];
            this.epochsPerSample = [];
            this.epochOfNextSample = [];
            this.epochOfNextNegativeSample = [];
            this.epochsPerNegativeSample = [];
            this.moveOther = true;
            this.initialAlpha = 1.0;
            this.alpha = 1.0;
            this.gamma = 1.0;
            this.a = 1.5769434603113077;
            this.b = 0.8950608779109733;
            this.dim = 2;
            this.nEpochs = 500;
            this.nVertices = 0;
        }
        return OptimizationState;
    }());
    function clip(x, clipValue) {
        if (x > clipValue)
            return clipValue;
        else if (x < -clipValue)
            return -clipValue;
        else
            return x;
    }
    function rDist(x, y) {
        var result = 0.0;
        for (var i = 0; i < x.length; i++) {
            result += Math.pow(x[i] - y[i], 2);
        }
        return result;
    }
    function findABParams(spread, minDist) {
        var curve = function (_a) {
            var _b = __read(_a, 2), a = _b[0], b = _b[1];
            return function (x) {
                return 1.0 / (1.0 + a * Math.pow(x, (2 * b)));
            };
        };
        var xv = utils$1
            .linear(0, spread * 3, 300)
            .map(function (val) { return (val < minDist ? 1.0 : val); });
        var yv = utils$1.zeros(xv.length).map(function (val, index) {
            var gte = xv[index] >= minDist;
            return gte ? Math.exp(-(xv[index] - minDist) / spread) : val;
        });
        var initialValues = [0.5, 0.5];
        var data = { x: xv, y: yv };
        var options = {
            damping: 1.5,
            initialValues: initialValues,
            gradientDifference: 10e-2,
            maxIterations: 100,
            errorTolerance: 10e-3,
        };
        var parameterValues = ml_levenberg_marquardt_1.default(data, curve, options).parameterValues;
        var _a = __read(parameterValues, 2), a = _a[0], b = _a[1];
        return { a: a, b: b };
    }
    exports.findABParams = findABParams;
    function fastIntersection(graph, target, unknownDist, farDist) {
        if (unknownDist === void 0) { unknownDist = 1.0; }
        if (farDist === void 0) { farDist = 5.0; }
        return graph.map(function (value, row, col) {
            if (target[row] === -1 || target[col] === -1) {
                return value * Math.exp(-unknownDist);
            }
            else if (target[row] !== target[col]) {
                return value * Math.exp(-farDist);
            }
            else {
                return value;
            }
        });
    }
    exports.fastIntersection = fastIntersection;
    function resetLocalConnectivity(simplicialSet) {
        simplicialSet = matrix$1.normalize(simplicialSet, "max");
        var transpose = matrix$1.transpose(simplicialSet);
        var prodMatrix = matrix$1.pairwiseMultiply(transpose, simplicialSet);
        simplicialSet = matrix$1.add(simplicialSet, matrix$1.subtract(transpose, prodMatrix));
        return matrix$1.eliminateZeros(simplicialSet);
    }
    exports.resetLocalConnectivity = resetLocalConnectivity;
    function initTransform(indices, weights, embedding) {
        var result = utils$1
            .zeros(indices.length)
            .map(function (z) { return utils$1.zeros(embedding[0].length); });
        for (var i = 0; i < indices.length; i++) {
            for (var j = 0; j < indices[0].length; j++) {
                for (var d = 0; d < embedding[0].length; d++) {
                    var a = indices[i][j];
                    result[i][d] += weights[i][j] * embedding[a][d];
                }
            }
        }
        return result;
    }
    exports.initTransform = initTransform;
    });

    unwrapExports(umap);
    var umap_1 = umap.UMAP;
    var umap_2 = umap.euclidean;
    var umap_3 = umap.cosine;
    var umap_4 = umap.findABParams;
    var umap_5 = umap.fastIntersection;
    var umap_6 = umap.resetLocalConnectivity;
    var umap_7 = umap.initTransform;

    var dist = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.UMAP = umap.UMAP;
    });

    unwrapExports(dist);
    var dist_1 = dist.UMAP;

    /* Copyright 2019 Google LLC All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
      ==============================================================================*/

      
    const N_EPOCHS = 400;
    const timescale = d3
      .scaleLinear()
      .domain([0, 20, 50, 100, 200, 6000])
      .range([60, 30, 20, 10, 0]);
      function runDemo(points, canvas, options,params,demoname) {
        // Prepare the UMAP options
        const demo={};
        let paused=false;
        const umapOptions = {
            nEpochs: N_EPOCHS,
            ...options
        };

        // Extract the instruction set from points and remove it from points
        // Prepare the data
    
        // Decide mypoints based on the instruction set
        decideMyPoints(options,params, demoname)
        .then(data => {
            const mypoints = data;
      
        const solution = mypoints.map((coords, i) => {
          return new Point(coords, points[i].color);
        });
    
        // Visualize the solution
        visualize(solution, canvas, "");
    
        // No need to manage pause/unpause/destroy here, as we're not animating
      })
      .catch(error => {
        console.error(`Error: ${error}`);
    });

    demo.pause = function() {
      if (paused) return; // already paused
      paused = true;
    
    };
    demo.unpause = function() {
    };
    demo.paused = function() {
      return paused;
    };
    demo.destroy = function() {
      demo.pause();
    };
  
    return demo;
    }

    function decideMyPoints(options, globalParams, demoName) {
      var { nNeighbors, minDist, hub_num } = options;
      if (nNeighbors === 0) {
        nNeighbors = 3;
      }
      if (hub_num === 0) {
        hub_num = 2;
      }  
      // Prepare the directory based on globalParams
      var paramFolder = globalParams.join('_');
      if(demoName === 'Rotated Lines, clustered') {
        // Change the third value to 0
        globalParams[2] = 0;
        
        paramFolder = globalParams.join('_');
    }
    if(demoName === 'Linked Clusters') {
      // Change the third value to 0
      globalParams[3] = 5;
      
      paramFolder = globalParams.join('_');
  }
  if(demoName === 'Ellipsoidal Gaussian Cloud') {
    // Change the third value to 0
    globalParams[1] = 100;
    
    paramFolder = globalParams.join('_');
}
if(demoName === 'Gaussian Cloud') {
  // Change the third value to 0
  globalParams[1] = 100;
  
  paramFolder = globalParams.join('_');
}
if(demoName === 'Two Different-Sized Clusters') {
  // Change the third value to 0
  globalParams[2] = 10;
  
  paramFolder = globalParams.join('_');
}

      // Create the file name
      const fileName = `${paramFolder}_${nNeighbors}_${minDist.toFixed(2)}_${hub_num}.json`;  
      // Create the directory path
      const dirPath = `outputs/${demoName}/${paramFolder}/`; 
  
      // Full path to the file
      const filePath = encodeURI(dirPath + fileName);

  
      // Fetch the data from the server and return it as a Promise
      return fetch(filePath)
          .then(response => {
            console.log(response);
            
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
          })
          .catch(e => {
              console.error(`Error fetching file: ${e}`);
          });
        
  }

    /* src/visualizations/toy_visualization/components/Preview.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/visualizations/toy_visualization/components/Preview.svelte";

    function create_fragment$1(ctx) {
    	var div, canvas_1, div_class_value, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "width", 150);
    			attr_dev(canvas_1, "height", 150);
    			attr_dev(canvas_1, "class", "svelte-1kx2hq9");
    			add_location(canvas_1, file$1, 96, 2, 2249);
    			attr_dev(div, "class", div_class_value = "demo-data " + (ctx.selected ? 'selected' : '') + " svelte-1kx2hq9");
    			add_location(div, file$1, 95, 0, 2175);
    			dispose = listen_dev(div, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas_1);
    			ctx.canvas_1_binding(canvas_1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.selected) && div_class_value !== (div_class_value = "demo-data " + (ctx.selected ? 'selected' : '') + " svelte-1kx2hq9")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			ctx.canvas_1_binding(null);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      let { demo, onClick, selected } = $$props;

      let canvas;

      

      const points = demo.previewOverride
        ? getDemoPreviewOverride(demo)
        : getPoints(demo);


      onMount(() => {
        visualize(points, canvas, null, null);
      });

    	const writable_props = ['demo', 'onClick', 'selected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Preview> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('canvas', canvas = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('demo' in $$props) $$invalidate('demo', demo = $$props.demo);
    		if ('onClick' in $$props) $$invalidate('onClick', onClick = $$props.onClick);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	$$self.$capture_state = () => {
    		return { demo, onClick, selected, canvas };
    	};

    	$$self.$inject_state = $$props => {
    		if ('demo' in $$props) $$invalidate('demo', demo = $$props.demo);
    		if ('onClick' in $$props) $$invalidate('onClick', onClick = $$props.onClick);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$props.canvas);
    	};

    	return {
    		demo,
    		onClick,
    		selected,
    		canvas,
    		canvas_1_binding
    	};
    }

    class Preview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["demo", "onClick", "selected"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Preview", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.demo === undefined && !('demo' in props)) {
    			console.warn("<Preview> was created without expected prop 'demo'");
    		}
    		if (ctx.onClick === undefined && !('onClick' in props)) {
    			console.warn("<Preview> was created without expected prop 'onClick'");
    		}
    		if (ctx.selected === undefined && !('selected' in props)) {
    			console.warn("<Preview> was created without expected prop 'selected'");
    		}
    	}

    	get demo() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set demo(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/components/Slider.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/shared/components/Slider.svelte";

    function create_fragment$2(ctx) {
    	var input, dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", ctx.min);
    			attr_dev(input, "max", ctx.max);
    			attr_dev(input, "step", ctx.step);
    			attr_dev(input, "class", "svelte-fa559t");
    			add_location(input, file$2, 134, 0, 3399);

    			dispose = [
    				listen_dev(input, "change", ctx.input_change_input_handler),
    				listen_dev(input, "input", ctx.input_change_input_handler),
    				listen_dev(input, "change", ctx.onSliderChange)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.value);
    		},

    		p: function update(changed, ctx) {
    			if (changed.value) set_input_value(input, ctx.value);

    			if (changed.min) {
    				attr_dev(input, "min", ctx.min);
    			}

    			if (changed.max) {
    				attr_dev(input, "max", ctx.max);
    			}

    			if (changed.step) {
    				attr_dev(input, "step", ctx.step);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(input);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	/* Copyright 2019 Google LLC All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
      ==============================================================================*/

      let { value, min = 0, max = 100, step = 1, onChange = () => {} } = $$props;

      const onSliderChange = e => {
        onChange(e.target.value);
      };

    	const writable_props = ['value', 'min', 'max', 'step', 'onChange'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('min' in $$props) $$invalidate('min', min = $$props.min);
    		if ('max' in $$props) $$invalidate('max', max = $$props.max);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('onChange' in $$props) $$invalidate('onChange', onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => {
    		return { value, min, max, step, onChange };
    	};

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('min' in $$props) $$invalidate('min', min = $$props.min);
    		if ('max' in $$props) $$invalidate('max', max = $$props.max);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('onChange' in $$props) $$invalidate('onChange', onChange = $$props.onChange);
    	};

    	return {
    		value,
    		min,
    		max,
    		step,
    		onChange,
    		onSliderChange,
    		input_change_input_handler
    	};
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["value", "min", "max", "step", "onChange"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Slider", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.value === undefined && !('value' in props)) {
    			console.warn("<Slider> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/visualizations/toy_visualization/components/Parameter.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/visualizations/toy_visualization/components/Parameter.svelte";

    function create_fragment$3(ctx) {
    	var div1, span0, t0, t1, span1, t2, t3, div0, updating_value, current;

    	function slider_value_binding(value_1) {
    		ctx.slider_value_binding.call(null, value_1);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let slider_props = {
    		min: ctx.min,
    		max: ctx.max,
    		step: ctx.step,
    		onChange: ctx.onChange
    	};
    	if (ctx.value !== void 0) {
    		slider_props.value = ctx.value;
    	}
    	var slider = new Slider({ props: slider_props, $$inline: true });

    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span0 = element("span");
    			t0 = text(ctx.name);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(ctx.value);
    			t3 = space();
    			div0 = element("div");
    			slider.$$.fragment.c();
    			add_location(span0, file$3, 33, 2, 986);
    			add_location(span1, file$3, 34, 2, 1008);
    			attr_dev(div0, "class", "slider-container svelte-t7irbq");
    			add_location(div0, file$3, 35, 2, 1031);
    			add_location(div1, file$3, 32, 0, 978);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span0);
    			append_dev(span0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, span1);
    			append_dev(span1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			mount_component(slider, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.value) {
    				set_data_dev(t2, ctx.value);
    			}

    			var slider_changes = {};
    			if (changed.onChange) slider_changes.onChange = ctx.onChange;
    			if (!updating_value && changed.value) {
    				slider_changes.value = ctx.value;
    			}
    			slider.$set(slider_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(slider);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { options, value, onChange = () => {} } = $$props;

      const { name, min, max } = options;
      const step = options.step || 1;

    	const writable_props = ['options', 'value', 'onChange'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Parameter> was created with unknown prop '${key}'`);
    	});

    	function slider_value_binding(value_1) {
    		value = value_1;
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('onChange' in $$props) $$invalidate('onChange', onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => {
    		return { options, value, onChange };
    	};

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('onChange' in $$props) $$invalidate('onChange', onChange = $$props.onChange);
    	};

    	return {
    		options,
    		value,
    		onChange,
    		name,
    		min,
    		max,
    		step,
    		slider_value_binding
    	};
    }

    class Parameter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["options", "value", "onChange"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Parameter", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.options === undefined && !('options' in props)) {
    			console.warn("<Parameter> was created without expected prop 'options'");
    		}
    		if (ctx.value === undefined && !('value' in props)) {
    			console.warn("<Parameter> was created without expected prop 'value'");
    		}
    	}

    	get options() {
    		throw new Error("<Parameter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Parameter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Parameter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Parameter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<Parameter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<Parameter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/visualizations/toy_visualization/components/Visualization.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/visualizations/toy_visualization/components/Visualization.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.demoOption = list[i];
    	child_ctx.each_value = list;
    	child_ctx.demoOption_index = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.demo = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (249:4) {#each demos as demo, i}
    function create_each_block_1(ctx) {
    	var current;

    	var preview = new Preview({
    		props: {
    		demo: ctx.demo,
    		onClick: ctx.handlePreviewClick(ctx.i),
    		selected: ctx.i === ctx.selectedDemoIndex
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			preview.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(preview, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var preview_changes = {};
    			if (changed.selectedDemoIndex) preview_changes.selected = ctx.i === ctx.selectedDemoIndex;
    			preview.$set(preview_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(preview.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(preview.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(preview, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(249:4) {#each demos as demo, i}", ctx });
    	return block;
    }

    // (263:10) {:else}
    function create_else_block(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "settings";
    			attr_dev(i, "class", "material-icons svelte-e37zij");
    			add_location(i, file$4, 263, 12, 5688);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(263:10) {:else}", ctx });
    	return block;
    }

    // (261:10) {#if isRunning}
    function create_if_block(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "settings";
    			attr_dev(i, "class", "material-icons svelte-e37zij");
    			add_location(i, file$4, 261, 12, 5622);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(261:10) {#if isRunning}", ctx });
    	return block;
    }

    // (295:8) {#each demo.options as demoOption (demoOption.name)}
    function create_each_block(key_1, ctx) {
    	var first, updating_value, current;

    	function parameter_value_binding(value) {
    		ctx.parameter_value_binding.call(null, value, ctx);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let parameter_props = {
    		options: ctx.demoOption,
    		onChange: ctx.restart
    	};
    	if (ctx.demoOption.start !== void 0) {
    		parameter_props.value = ctx.demoOption.start;
    	}
    	var parameter = new Parameter({ props: parameter_props, $$inline: true });

    	binding_callbacks.push(() => bind(parameter, 'value', parameter_value_binding));

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			parameter.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(parameter, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var parameter_changes = {};
    			if (changed.demo) {
            parameter_changes.options = ctx.demoOption;
            
          }
    			if (!updating_value && changed.demo) {
    				parameter_changes.value = ctx.demoOption.start;
    			}
    			parameter.$set(parameter_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(parameter.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(parameter.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(first);
    			}

    			destroy_component(parameter, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(295:8) {#each demo.options as demoOption (demoOption.name)}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div12, div0, canvas_1, t0, div1, t1, div11, div6, div3, button0, t2, button1, i, button1_disabled_value, t4, div2, t5, br, t6, span, t7, t8, div5, div4, t10, updating_value, t11, updating_value_1,updating_value_2,t12,t17,div10, div7, t13_value = ctx.demo.description + "", t13, t14, div9, div8, t16, each_blocks = [], each1_lookup = new Map(), current, dispose;

    	let each_value_1 = allDemos;

    	let each_blocks_1 = [];

    	for (let i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    		each_blocks_1[i_1] = create_each_block_1(get_each_context_1(ctx, each_value_1, i_1));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	function select_block_type(changed, ctx) {
    		if (ctx.isRunning) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	function parameter0_value_binding(value) {
    		ctx.parameter0_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let parameter0_props = {
    		options: { name: 'n_neighbors', min: nNeighborsMin, max: nNeighborsMax, step: 5 },
    		onChange: ctx.restart
    	};
     
    	if (ctx.nNeighbors !== void 0) {
    		parameter0_props.value = ctx.nNeighbors;
    	}
      
  
    	var parameter0 = new Parameter({ props: parameter0_props, $$inline: true });

    	binding_callbacks.push(() => bind(parameter0, 'value', parameter0_value_binding));

    	function parameter1_value_binding(value_1) {
    		ctx.parameter1_value_binding.call(null, value_1);
    		updating_value_1 = true;
    		add_flush_callback(() => updating_value_1 = false);
    	}

    	let parameter1_props = {
    		options: { name: 'min_dist', min: minDistMin, max: minDistMax, step: 0.10 },
    		onChange: ctx.restart
    	};
    	if (ctx.minDist !== void 0) {
    		parameter1_props.value = ctx.minDist;
    	}
    	var parameter1 = new Parameter({ props: parameter1_props, $$inline: true });

    	binding_callbacks.push(() => bind(parameter1, 'value', parameter1_value_binding));
      
      function parameter2_value_binding(value_2) {
    		ctx.parameter2_value_binding.call(null, value_2);
    		updating_value_2 = true;
    		add_flush_callback(() => updating_value_2 = false);
    	}

    	let parameter2_props = {
    		options: { name: 'hub_num', min: hub_numMin, max: hub_numMax, step: 5 },
    		onChange: ctx.restart
    	};
      
    	if (ctx.hub_num !== void 0) {
    		parameter2_props.value = ctx.hub_num;
    	}
      if(parameter2_props.value == 0) {
        parameter2_props.value = 2;
      }
      
    	var parameter2 = new Parameter({ props: parameter2_props, $$inline: true });

    	binding_callbacks.push(() => bind(parameter2, 'value', parameter2_value_binding));


    	let each_value = ctx.demo.options;

    	const get_key = ctx => ctx.demoOption.name;

    	for (let i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i_1);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i_1] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div0 = element("div");
    			canvas_1 = element("canvas");
    			t0 = space();
    			div1 = element("div");

    			for (let i_1 = 0; i_1 < each_blocks_1.length; i_1 += 1) {
    				each_blocks_1[i_1].c();
    			}

    			t1 = space();
    			div11 = element("div");
    			div6 = element("div");
    			div3 = element("div");
          div3.textContent="Optimize Hyper-parameters";
    			button0 = element("button");
    			if_block.c();
    			t2 = space();
    			button1 = element("button");
    			i = element("i");
    			i.textContent = "refresh";
    			t4 = space();
    			div2 = element("div");
    			t5 = text("\n    \n      ");
    			br = element("br");
    			t6 = space();
    			span = element("span");
    			t7 = space();
    			t8 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "UMATO Parameters";
    			t10 = space();
    			parameter0.$$.fragment.c();
    			t11 = space();
    			parameter1.$$.fragment.c();
    			t12 = space();
          parameter2.$$.fragment.c();
          t17= space();
    			div10 = element("div");
    			div7 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Dataset Parameters";
    			t16 = space();

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}
    			attr_dev(canvas_1, "class", "output svelte-e37zij");
    			attr_dev(canvas_1, "width", "600");
    			attr_dev(canvas_1, "height", "600");
    			add_location(canvas_1, file$4, 244, 4, 5137);
    			attr_dev(div0, "class", "playground-canvas svelte-e37zij");
    			add_location(div0, file$4, 243, 2, 5101);
    			attr_dev(div1, "class", "data-menu svelte-e37zij");
    			add_location(div1, file$4, 247, 2, 5219);
    			attr_dev(button0, "class", "play-pause svelte-e37zij");
    			button0.disabled = ctx.isFinished;
    			add_location(button0, file$4, 259, 8, 5513);
    			attr_dev(i, "class", "material-icons svelte-e37zij");
    			add_location(i, file$4, 270, 10, 5890);
    			attr_dev(button1, "class", "restart svelte-e37zij");
    			button1.disabled = button1_disabled_value = ctx.isRunning || ctx.step === 0;
    			add_location(button1, file$4, 266, 8, 5771);
    			attr_dev(br, "class", "svelte-e37zij");
    			add_location(br, file$4, 274, 10, 6007);
    			attr_dev(span, "class", "step svelte-e37zij");
    			add_location(span, file$4, 275, 10, 6024);
    			attr_dev(div2, "class", "steps-display svelte-e37zij");
    			add_location(div2, file$4, 272, 8, 5954);
    			attr_dev(div3, "class", "play-controls svelte-e37zij");
    			add_location(div3, file$4, 258, 6, 5477);
    			attr_dev(div4, "class", "parameters-label svelte-e37zij");
    			add_location(div4, file$4, 279, 8, 6126);
    			attr_dev(div5, "class", "umap-options svelte-e37zij");
    			add_location(div5, file$4, 278, 6, 6091);
    			attr_dev(div6, "class", "data-controls svelte-e37zij");
    			add_location(div6, file$4, 257, 4, 5443);
    			attr_dev(div7, "class", "data-description-text svelte-e37zij");
    			add_location(div7, file$4, 291, 6, 6590);
    			attr_dev(div8, "class", "parameters-label svelte-e37zij");
    			add_location(div8, file$4, 293, 8, 6691);
    			attr_dev(div9, "class", "data-options svelte-e37zij");
    			add_location(div9, file$4, 292, 6, 6656);
    			attr_dev(div10, "class", "data-description svelte-e37zij");
    			add_location(div10, file$4, 290, 4, 6553);
    			attr_dev(div11, "class", "data-details svelte-e37zij");
    			add_location(div11, file$4, 256, 2, 5412);
    			attr_dev(div12, "class", "playground svelte-e37zij");
    			add_location(div12, file$4, 241, 0, 5073);

    			dispose = [
    				listen_dev(button0, "click", ctx.playPause),
    				listen_dev(button1, "click", ctx.restart)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div0);
    			append_dev(div0, canvas_1);
    			ctx.canvas_1_binding(canvas_1);
    			append_dev(div12, t0);
    			append_dev(div12, div1);

    			for (let i_1 = 0; i_1 < each_blocks_1.length; i_1 += 1) {
    				each_blocks_1[i_1].m(div1, null);
    			}

    			append_dev(div12, t1);
    			append_dev(div12, div11);
    			append_dev(div11, div6);
    			append_dev(div6, div3);
    			append_dev(div3, button0);
    			if_block.m(button0, null);
    			append_dev(div3, t2);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, t5);
    			append_dev(div2, br);
    			append_dev(div2, t6);
    			append_dev(div2, span);
    			append_dev(span, t7);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t10);
    			mount_component(parameter0, div5, null);
    			append_dev(div5, t11);
    			mount_component(parameter1, div5, null);
          append_dev(div5, t12);
    			mount_component(parameter2, div5, null);
          append_dev(div5, t17);
    			append_dev(div11, t17);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, t13);
    			append_dev(div10, t14);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div9, t16);

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(div9, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
          
    			if (changed.demos || changed.handlePreviewClick || changed.selectedDemoIndex) {
    				each_value_1 = allDemos;
    				let i_1;
    				for (i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i_1);

    					if (each_blocks_1[i_1]) {
    						each_blocks_1[i_1].p(changed, child_ctx);
    						transition_in(each_blocks_1[i_1], 1);
    					} else {
    						each_blocks_1[i_1] = create_each_block_1(child_ctx);
    						each_blocks_1[i_1].c();
    						transition_in(each_blocks_1[i_1], 1);
    						each_blocks_1[i_1].m(div1, null);
    					}
    				}

    				group_outros();
    				for (i_1 = each_value_1.length; i_1 < each_blocks_1.length; i_1 += 1) {
    					out(i_1);
    				}
    				check_outros();
    			}

    			if (current_block_type !== (current_block_type = select_block_type(changed, ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(button0, null);
    				}
            
    			}

    			if (!current || changed.isFinished) {
    				prop_dev(button0, "disabled", ctx.isFinished);
    			}

    			if ((!current || changed.isRunning || changed.step) && button1_disabled_value !== (button1_disabled_value = ctx.isRunning || ctx.step === 0)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (!current || changed.step) {
    				set_data_dev(t7, ctx.step);
    			}

    			var parameter0_changes = {};
    			if (!updating_value && changed.nNeighbors) {
    				parameter0_changes.value = ctx.nNeighbors;
    			}
    			parameter0.$set(parameter0_changes);

    			var parameter1_changes = {};
    			if (!updating_value_1 && changed.minDist) {
    				parameter1_changes.value = ctx.minDist;
    			}
    			parameter1.$set(parameter1_changes);

          var parameter2_changes = {};
    			if (!updating_value_2 && changed.hub_num) {
    				parameter2_changes.value = ctx.hub_num;
    			}
    			parameter2.$set(parameter2_changes);

    			if ((!current || changed.demo) && t13_value !== (t13_value = ctx.demo.description + "")) {
    				set_data_dev(t13, t13_value);
    			}

    			const each_value = ctx.demo.options;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each1_lookup, div9, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    				transition_in(each_blocks_1[i_1]);
    			}

    			transition_in(parameter0.$$.fragment, local);

    			transition_in(parameter1.$$.fragment, local);

          transition_in(parameter2.$$.fragment, local);

    			for (let i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    				transition_in(each_blocks[i_1]);
    			}



    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);
    			for (let i_1 = 0; i_1 < each_blocks_1.length; i_1 += 1) {
    				transition_out(each_blocks_1[i_1]);
    			}

    			transition_out(parameter0.$$.fragment, local);
    			transition_out(parameter1.$$.fragment, local);
          transition_out(parameter2.$$.fragment, local);

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				transition_out(each_blocks[i_1]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div12);
    			}

    			ctx.canvas_1_binding(null);

    			destroy_each(each_blocks_1, detaching);

    			if_block.d();

    			destroy_component(parameter0);

    			destroy_component(parameter1);

          destroy_component(parameter2);

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].d();
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    let nNeighborsMin = 0;

    let nNeighborsMax = 100;

    let hub_numMax=100;
    let hub_numMin=0;

    let minDistMin = 0;

    let minDistMax = 1;

    function instance$4($$self, $$props, $$invalidate) {
    	

      let isRunning = false;
      let isFinished = false;
      let optimal=false;
      let lastSelectedDemoIndex = 0;
      let selectedDemoIndex = 0;
      let points = [];
      let demo = allDemos[selectedDemoIndex];
      let step = 0;
      let canvas;
      let param= 0;

      let nNeighbors = 15;

      let minDist = 0.1;

      let hub_num = 10;

      let runningDemo;
            


      let handlePreviewClick = index => () => {
        $$invalidate('selectedDemoIndex', selectedDemoIndex = index);
        $$invalidate('demo', demo = allDemos[selectedDemoIndex]);
        optimal=true;
        beginRunDemo();
      };

      const playPause = () => {
          optimal=true;
          beginRunDemo();
        
      };

      function optimalParams(demoName) {
        // Define optimal parameters for each demo
        const optimalParamsMap = {
          'Star': { nNeighbors: 10, minDist: 0.0, hub_num: 85 },
          'Linked Clusters': { nNeighbors: 90, minDist: 0.8, hub_num: 40 },
          'Rotated Lines': { nNeighbors: 90, minDist: 0.8, hub_num: 40 },
          'Rotated Lines, clustered': { nNeighbors: 90, minDist: 0.8, hub_num: 0 },
          'Sine frequency': { nNeighbors: 55, minDist: 0, hub_num: 55 },
          'Sine phase': { nNeighbors: 20 , minDist: 0, hub_num: 100 },
          'Grid': { nNeighbors: 10, minDist: 0, hub_num: 100 },
          'Two Clusters': { nNeighbors: 100, minDist: 0.1, hub_num: 100 },
          'Three Clusters': { nNeighbors: 100, minDist: 0.1, hub_num: 100 },
          'Two Different-Sized Clusters': { nNeighbors: 0, minDist: 0, hub_num: 85 },
          'Two Long Linear Clusters': { nNeighbors: 35, minDist: 0, hub_num: 70 },
          'Cluster In Cluster': { nNeighbors: 0, minDist: 0, hub_num: 100 },
          'Circle (Evenly Spaced)': { nNeighbors: 5, minDist: 0, hub_num: 95 },
          'Circle (Randomly Spaced)': { nNeighbors: 10, minDist: 0, hub_num: 95 },
          'Gaussian Cloud': { nNeighbors: 35, minDist: 1, hub_num: 40 },
          'Ellipsoidal Gaussian Cloud': { nNeighbors: 35, minDist: 1, hub_num: 40 },
          'Trefoil Knot': { nNeighbors: 10, minDist: 0, hub_num: 90 },
          'Linked Rings': { nNeighbors: 15, minDist: 0, hub_num: 85 },
          'Unlinked Rings': { nNeighbors: 55, minDist: 0, hub_num: 70 },
          'Orthogonal Steps': { nNeighbors: 55, minDist: 0, hub_num: 100 },
          'Random Walk': { nNeighbors: 55, minDist: 0, hub_num: 100 },
          'Random Jump': { nNeighbors: 55, minDist: 0, hub_num: 100 },
          'Equally Spaced': { nNeighbors: 0, minDist: 0, hub_num: 30 },
          'Uniform Distribution': { nNeighbors: 35, minDist: 1, hub_num: 40 },

          


          
          
          // Add more demos as needed
        };
      
        // Return the optimal parameters for the specified demo,
        // or a default set of parameters if the demo name is not recognized
        return optimalParamsMap[demoName] ;
      }
      
      function optimalGlobal(demoName) {
        // Define optimal global parameters for each demo
        const optimalGlobalMap = {
          'Star': [250,5,45],
          'Linked Clusters':[10,30,30,5],
          'Rotated Lines': [200,10],
          'Rotated Lines, clustered':[200,9,0,25],
          'Sine frequency': [160,155],
          'Sine phase': [140,305],
          'Grid': [30],
          'Two Clusters': [110,35],
          'Three Clusters': [110,25],
          'Two Different-Sized Clusters': [90,45,10],
          'Two Long Linear Clusters': [100],
          'Cluster In Cluster': [110,35],
          'Circle (Evenly Spaced)': [100],
          'Circle (Randomly Spaced)': [100],
          'Gaussian Cloud': [100,100],
          'Ellipsoidal Gaussian Cloud': [100,100],
          'Trefoil Knot': [170],
          'Linked Rings': [180],
          'Unlinked Rings': [200],
          'Orthogonal Steps': [850],
          'Random Walk': [850,902],
          'Random Jump': [850,903],
          'Equally Spaced': [100],
          'Uniform Distribution': [200,12],
          // Add more demos as needed
        };
      
        // Return the optimal global parameters for the specified demo,
        // or a default set of parameters if the demo name is not recognized
        return optimalGlobalMap[demoName];
      }
      

      const restart = () => {
        beginRunDemo();
      };

      const beginRunDemo = () => {
     
        $$invalidate('isRunning', isRunning = true);
        $$invalidate('isFinished', isFinished = false);
        
        let result = Math.floor(points.length / 5) * 5;
        if (result==points.length)
        result-=5;

        if (nNeighbors >= points.length) {
          
          $$invalidate('nNeighbors', nNeighbors = result);
        }

        if (hub_num >= points.length) {
          $$invalidate('hub_num', hub_num = result);
        }

        var umapOptions = { nNeighbors, minDist, hub_num};
        if (optimal){
          umapOptions = optimalParams(demo.name);
          globalParams=optimalGlobal(demo.name);
          optimal=false;
          $$invalidate('nNeighbors', nNeighbors = umapOptions.nNeighbors);
          $$invalidate('hub_num', hub_num = umapOptions.hub_num);
          $$invalidate('minDist', minDist = umapOptions.minDist);

           demo.options.forEach((option, i) => {
            option.start = globalParams[i];
            
          });
          $$invalidate('demo', demo);
        }
        
        points=getPoints(demo);
      
        runningDemo = runDemo(points, canvas, umapOptions,globalParams,demo.name);
      }
      

      onMount(() => {
        points = getPoints(demo);
        
        visualize(points, canvas, null, null);
      });

      afterUpdate(() => {
        

        $$invalidate('demo', demo = allDemos[selectedDemoIndex]);
        points=getPoints(demo);
        
      });

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('canvas', canvas = $$value);
    		});
    	}

    	function parameter0_value_binding(value) {
    		nNeighbors = value;
    		$$invalidate('nNeighbors', nNeighbors);
    	}

    	function parameter1_value_binding(value_1) {
    		minDist = value_1;
    		$$invalidate('minDist', minDist);
    	}

      function parameter2_value_binding(value_2) {
    		hub_num = value_2;
    		$$invalidate('hub_num', hub_num);
    	}

      function parameter_value_binding(value, { demoOption }) {
   
       
        demoOption.start = value;
        $$invalidate('demo', demo);
        $$invalidate('demoOption', demoOption = value);
       
      }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('isRunning' in $$props) $$invalidate('isRunning', isRunning = $$props.isRunning);
    		if ('isFinished' in $$props) $$invalidate('isFinished', isFinished = $$props.isFinished);
    		if ('lastSelectedDemoIndex' in $$props) lastSelectedDemoIndex = $$props.lastSelectedDemoIndex;
    		if ('selectedDemoIndex' in $$props) $$invalidate('selectedDemoIndex', selectedDemoIndex = $$props.selectedDemoIndex);
    		if ('points' in $$props) points = $$props.points;
    		if ('demo' in $$props) $$invalidate('demo', demo = $$props.demo);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$props.canvas);
    		if ('nNeighbors' in $$props) $$invalidate('nNeighbors', nNeighbors = $$props.nNeighbors);
    		if ('nNeighborsMin' in $$props) $$invalidate('nNeighborsMin', nNeighborsMin = $$props.nNeighborsMin);
    		if ('nNeighborsMax' in $$props) $$invalidate('nNeighborsMax', nNeighborsMax = $$props.nNeighborsMax);
    		if ('minDist' in $$props) $$invalidate('minDist', minDist = $$props.minDist);
    		if ('minDistMin' in $$props) $$invalidate('minDistMin', minDistMin = $$props.minDistMin);
    		if ('minDistMax' in $$props) $$invalidate('minDistMax', minDistMax = $$props.minDistMax);
        if ('hub_num' in $$props) $$invalidate('hub_num', hub_num = $$props.hub_num);
    		if ('hub_numMin' in $$props) $$invalidate('hub_numMin', hub_numMin = $$props.hub_numMin);
    		if ('hub_numMax' in $$props) $$invalidate('hub_numMax', hub_numMax = $$props.hub_numMax);
    		if ('runningDemo' in $$props) runningDemo = $$props.runningDemo;
    		if ('handlePreviewClick' in $$props) $$invalidate('handlePreviewClick', handlePreviewClick = $$props.handlePreviewClick);
    	};

    	return {
    		isRunning,
    		isFinished,
    		selectedDemoIndex,
    		demo,
    		step,
    		canvas,
    		nNeighbors,
    		minDist,
        hub_num,
    		handlePreviewClick,
    		playPause,
    		restart,
    		canvas_1_binding,
    		parameter0_value_binding,
    		parameter1_value_binding,
        parameter2_value_binding,
    		parameter_value_binding
    	};
    }

    class Visualization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Visualization", options, id: create_fragment$4.name });
    	}
    }

    /* src/visualizations/toy_visualization/Figure.svelte generated by Svelte v3.12.1 */

    // (25:0) <Figure>
    function create_default_slot(ctx) {
    	var current;

    	var visualization = new Visualization({ $$inline: true });

    	const block = {
    		c: function create() {
    			visualization.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(visualization, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(visualization.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(visualization.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(visualization, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(27:0) <Figure>", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var current;

    	var figure = new Figure({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			figure.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(figure, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var figure_changes = {};
    			if (changed.$$scope) figure_changes.$$scope = { changed, ctx };
    			figure.$set(figure_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(figure.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(figure.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(figure, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class Figure_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Figure_1", options, id: create_fragment$5.name });
    	}
    }

    /* Copyright 2019 Google LLC All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
      ==============================================================================*/

    var main = new Figure_1({
      target: document.body
    });

    return main;

}(d3));
//# sourceMappingURL=bundle.js.map
