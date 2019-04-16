/**
 * Animated counter React component.
 *
 * @module src/Counter
 */

import React from 'react';
import { number } from 'prop-types';

/**
 * Animated counter React component.
 */
class Counter extends React.Component {
    /**
     * Cubic spline function (tangents assumed to be 0).
     *
     * @param {number} t - The current time (between 0 and 1).
     * @param {number} p0 - Start position.
     * @param {number} p1 - End position.
     * @returns {number} The interpolated position.
     */
    static cubicSpline(t, p0, p1) {
        const t2 = t * t;
        const t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * p0 + (-2 * t3 + 3 * t2) * p1;
    }

    /**
     * Initializes the component.
     *
     * @param {Object} props - The component's props.
     */
    constructor(props) {
        super(props);

        const { start } = props;

        this.state = {
            timer: null,
            count: start
        };

        this.frame = this.frame.bind(this);
        this.restart = this.restart.bind(this);
    }

    /**
     * Animation frame callback.
     *
     * @private
     */
    frame() {
        const { start, end, duration } = this.props;
        const { startTime } = this;

        const elapsed = Math.min(Date.now() - startTime, duration);
        const t = elapsed / duration;
        const count = Counter.cubicSpline(t, start, end).toFixed(0);

        // Try to count again if end not reached.
        const timer = t < 1
            ? requestAnimationFrame(this.frame)
            : null;
        this.setState({ count, timer });
    }

    /**
     * Updates the counter.
     *
     * @private
     */
    count() {
        if (this.state.timer !== null) {
            return;     // Timer already in progress.
        }

        // Mark starting time and start timer.
        this.startTime = Date.now();
        const timer = requestAnimationFrame(this.frame);
        this.setState({ timer });
    }

    /**
     * Restarts the counter.
     *
     * @private
     */
    restart() {
        this.setState({ count: this.props.start });
        this.count();
    }

    /**
     * React lifecycle handler called when component has mounted.
     */
    componentDidMount() {
        this.count();
    }

    /**
     * React lifecycle handler called when component is about to unmount.
     */
    componentWillUnmount() {
        const { timer } = this.state;
        if (timer !== null) {
            cancelAnimationFrame(timer);
        }
    }

    /**
     * Renders the component.
     *
     * @returns {ReactElement} The component's elements.
     */
    render() {
        return <span onClick={this.restart}>
            {this.state.count}
        </span>;
    }
}

Counter.defaultProps = {
    duration: 1000,
    start: 0
};

Counter.propTypes = {
    duration: number,
    start: number,
    end: number.isRequired
};

export default Counter;

