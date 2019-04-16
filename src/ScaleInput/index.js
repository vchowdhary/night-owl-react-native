/**
 * Scale-based input component.
 *
 * @module src/ScaleInput
 */

import React from 'react';
import {
    bool, number, string, func, arrayOf, shape, object, node
} from 'prop-types';
import classNames from 'classnames';

import styles from './index.less';

/**
 * Scale input row component.
 *
 * @private
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function ScaleInputRow(props) {
    const {
        name,
        value,
        scale,
        disabled,
        label,
        onChange
    } = props;

    let onRadioChange;
    if (onChange) {
        onRadioChange = function(event) {
            const radioValue = Number.parseInt(event.target.value, 10);
            onChange(name, radioValue);
        };
    }

    const cols = scale.map(function(scaleName, i) {
        const radioValue = i + 1;
        const checked = (radioValue === value);

        return <td key={radioValue}>
            <label className={classNames({
                [styles.checked]: checked
            })}>
                <span className={styles.text}>
                    {scaleName}
                </span>
                <input
                    type="radio"
                    name={name}
                    value={radioValue}
                    disabled={disabled}
                    checked={checked}
                    onChange={onRadioChange}
                />
            </label>
        </td>;
    });

    const labelElem = label && <th className={styles.text}>
        {label}
    </th>;

    return <tr>
        {labelElem}
        {cols}
        {labelElem}
    </tr>;
}

ScaleInputRow.propTypes = {
    name: string.isRequired,
    value: number,
    scale: arrayOf(string),
    disabled: bool,
    label: node,
    onChange: func
};

/**
 * Scale-based input group component.
 *
 * @alias module:src/ScaleInput.Group
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function ScaleInputGroup(props) {
    const {
        questions,
        legend,
        scale,
        values,
        disabled,
        onChange
    } = props;

    const questionRows = questions.map(function(rowProps) {
        const { name, label } = rowProps;

        return <ScaleInputRow
            key={name}
            name={name}
            value={values[name]}
            scale={rowProps.scale || scale}
            disabled={disabled}
            label={label}
            onChange={onChange}
        />;
    });

    let legendElem;
    if (legend) {
        const legendCols = legend.map(function(legendName, i) {
            return <th key={i} className={styles.text}>
                {legendName}
            </th>;
        });

        legendElem = <thead>
            <tr>
                <th />
                {legendCols}
                <th />
            </tr>
        </thead>;
    }

    return <div className={styles.scaleInput}>
        <table>
            {legendElem}
            <tbody>
                {questionRows}
            </tbody>
        </table>
    </div>;
}

ScaleInputGroup.propTypes = {
    questions: arrayOf(shape({
        name: string.isRequired,
        label: node,
        scale: arrayOf(string)
    })).isRequired,
    legend: arrayOf(string),
    scale: arrayOf(string),
    values: object.isRequired,
    disabled: bool,
    onChange: func
};

/**
 * Scale input component.
 *
 * @private
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function ScaleInput(props) {
    return <div className={styles.scaleInput}>
        <table>
            <tbody>
                <ScaleInputRow {...props} />
            </tbody>
        </table>
    </div>;
}

ScaleInput.propTypes = {
    name: string.isRequired,
    value: number,
    scale: arrayOf(string).isRequired,
    disabled: bool,
    label: node,
    onChange: func
};

export { ScaleInputGroup as Group };

export default ScaleInput;

