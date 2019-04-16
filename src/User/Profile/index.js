/* eslint-disable complexity */
/* eslint-disable guard-for-in */
/* eslint-disable react/no-direct-mutation-state */
/**
 * User profile.
 *ƒtutor
 * @module src/User/Profile
 */

import React from 'react';
import { string, node } from 'prop-types';

import XHRpromise from 'src/XHRpromise';
import Spinner from 'src/Spinner';
import User from 'src/User';

import styles from './index.less';
import LabeledInput from 'src/LabeledInput';

const API = '/api/subjects';

/**
 * Profile attributes.
 *
 * @private
 * @readonly
 * @enum {Object}
 */
const ATTRS = Object.freeze({
    origin: {
        desc: 'From'
    }
});

/**
 * Maximum text field length.
 *
 * @private
 * @readonly
 * @type {number}
 */
const TEXT_MAXLEN = 255;

/**
 * Maximum text area length, in bytes.
 *
 * @private
 * @readonly
 * @type {number}
 */
const TEXTAREA_MAXLEN = 2047;

/**
 * Profile attribute.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.desc - Description of the attribute.
 * @param {ReactNode} props.children - The value to display.
 * @returns {ReactElement} The component's elements.
 */
function ProfileAttr(props) {
    const { desc, children } = props;
    return <li>{desc}: {children}</li>;
}

ProfileAttr.propTypes = {
    desc: string,
    children: node
};

/**
 * User profile.
 */
class Profile extends React.Component {
    /**
     * Initializes the component.
     */
    constructor() {
        super();

        this.state = {
            id: '',
            disabled: true,
            loading: true,
            error: null,
            profile: null,
            matchIDs: null,
            tutoringSubjects: {},
            tutoringNeedRows: [],
            tutoringNeedSelected: '',
            tutoring: {},
            tutoringNeeds: {},
            tutoringRows: [],
            delivery: {},
            deliveryCategories: {},
            deliveryNeedRows: [],
            deliveryNeedSelected: '',
            deliveryRows: [],
            deliveryselected: '',
            selected: '',
            newdelivery: '',
            newneedcategory: '',
            newneedsubject: '',
            newsubject: '',
            bio: ''
        };

        [
            'onChange',
            'handleChange',
            'onEditClick',
            'renderDropdown',
            'onTutoringChange',
            'SubjectsDropdown',
            'addSubject',
            'Other',
            'SubjectList',
            'Subject',
            'removeFromTutoring',
            'removeFromDelivery',
            'pushToDatabase',
            'onDeliveryChange',
            'addDeliveryCategory',
            'DeliveryDropdown',
            'DeliveryList',
            'Category',
            'addNeedSubject',
            'removeFromTutoringNeeds',
            'onTutoringNeedsChange',
            'onDeliveryNeedsChange',
            'removeFromDeliveryNeeds',
            'addNeedCategory',
            'updateRows'
        ].forEach(key => {
            this[key] = this[key].bind(this);
        });
    }

    /**
     * Refreshes the current profile.
     *
     * @returns {void} Resolves when the refresh has completed.
     */
    async refreshProfile() {
        const { id } = this.props;
        console.log(id);
        const reqURL = `/api/users/${encodeURIComponent(id)}`;

        this.setState({ loading: true });

        try {
            const { response } = await XHRpromise('GET', reqURL, {
                successStatus: 200
            });

            const profile = JSON.parse(response);
            this.setState({ profile });
            this.setState({ 
                id: id,
                tutoring: profile.tutoring, 
                tutoringNeeds: profile.tutoringNeeds, 
                delivery: profile.delivery,
                deliveryNeeds: profile.deliveryNeeds,
                bio: profile.bio
            });
            

        } catch (error) {
            this.setState({ error });
        } finally {
            this.setState({ loading: false });
        }
    }

    /**
     * Refreshes match IDs.
     *
     * @returns {void} Resolves when the refresh has completed.
     */
    async refreshMatchIDs() {
        const { id } = this.props;
        const { profile } = this.state;

        if (User.id !== id || !profile) {
            // Cannot have matches if not logged
            this.setState({ matchIDs: null });
            return;
        }

        this.setState({ loading: true });

        try {
            const { response } = await XHRpromise('GET', '/api/match', {
                successStatus: 200
            });

            const matchIDs = JSON.parse(response);
            this.setState({ matchIDs });
        } catch (error) {
            this.setState({ error });
        } finally {
            this.setState({ loading: false });
        }
    }

    /**
     * React lifecycle handler called when component has mounted.
     */
    async componentDidMount() {
        if (!this.state.loading) {
            return;
        }

        await this.refreshProfile();
        this.updateRows();
        //await this.refreshMatchIDs();
    }

    
    // eslint-disable-next-line require-jsdoc
    updateRows(){
        // eslint-disable-next-line guard-for-in
        for (var key in this.state.tutoring){
            if(key !== 'timetotutor'){
                this.state.tutoringRows.push({ name: key });
            }
        }

        for (var key2 in this.state.tutoringNeeds){
            if(key2 !== 'timetogettutored'){
                this.state.tutoringNeedRows.push({ name: key2 });
            }
        }
        
        for (var key3 in this.state.delivery){
            if(key3 !== 'timetodeliver' && key3 !== 'timetopickup'){
                this.state.deliveryRows.push({ name: key3 });
            }
        }

        for (var key4 in this.state.deliveryNeeds){
            if(key4 !== 'timetopickup'){
                this.state.deliveryNeedRows.push({ name: key4 });
            }
        }
    }

    /**
     * React lifecycle handler called when component has updated.
     *
     * @param {Object} prevProps - The component's previous props.
     */
    async componentDidUpdate(prevProps) {
        if (this.props.id === prevProps.id) {
            return;     // Profile has not changed.
        }

        await this.refreshProfile();
        // await this.refreshMatchIDs();
    }

    /**
    * Creates a change handler for the given key.
    *
    * @private
    * @param {Function} onChange - The handler to call.
    * @param {string} key - The key.
    * @returns {Function} The wrapped change handler.
    */
    handleChange(onChange, key) {
        return function(event) {
            event.preventDefault();
            onChange(key, event.target.value);
        };
    }


    /**
     *  On change handler
     * @param {key} key - . 
     * @param {value} value - new value
     */
    onChange(key, value){
        this.setState({ [key]: value });

        console.log(this.state);
        
    }

    /**
     * Edit button clicked
     */
    async onEditClick(){
        if(!this.state.disabled){
            this.state.profile.tutoring = this.state.tutoring;
            this.state.profile.delivery = this.state.delivery;
            this.state.profile.deliveryNeeds = this.state.deliveryNeeds;
            this.state.profile.tutoringNeeds = this.state.tutoringNeeds;
            this.state.profile.bio = this.state.bio;

            console.log('Updating profile...');
            console.log(this.state.id);
            await User.update(this.state.id, this.state.profile);
        }
        this.setState({ disabled: !this.state.disabled });
        
    }


    /**
     * Pushes new subject to the subject database
     * @param {name} name - name of new subject
     * @param {string} service - key of service
     */
    async pushToDatabase(name, service){
        console.log('Pushing subjects');
        const { status } = await XHRpromise('PUT', API, {
            contentType: 'application/json',
            body: JSON.stringify({ name, service })
        });
    
        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect.');
            default:
                throw new Error('Unknown error occurred.');
        }

        console.log('Finished PUSH request');

        
    }

    /**
     * Add subject
     * @param{event} event - event
     */
    addSubject(event){
        event.preventDefault();
        if(this.state.selected === 'other' || this.state.selected === '')
        {
            this.pushToDatabase(this.state.newsubject, 'tutoring');
            this.state.tutoringSubjects.push({ subject: this.state.newsubject });
            this.state.tutoring[[this.state.newsubject]] = { details: '', rating: 1, preference: 1 };
            this.state.tutoringRows.push({ name: this.state.newsubject });
        }
        else{
            this.state.tutoring[[this.state.selected]] = { details: '', rating: 1, preference: 1 };
            this.state.tutoringRows.push({ name: this.state.selected });
        }
        console.log(this.state);
    }

    /**
     * Add subject
     * @param{event} event - event
     */
    addNeedSubject(event){
        event.preventDefault();
        if(this.state.tutoringNeedSelected === 'other' || this.state.tutoringNeedSelected === '')
        {
            this.pushToDatabase(this.state.newneedsubject, 'tutoring');
            this.state.tutoringSubjects.push({ subject: this.state.newneedsubject });
            this.state.tutoringNeeds[[this.state.newneedsubject]] = { details: '', preference: 1 };
            this.state.tutoringNeedRows.push({ name: this.state.newneedsubject });
        }
        else{
            this.state.tutoringNeeds[[this.state.tutoringNeedSelected]] = { details: '', preference: 1 };
            this.state.tutoringNeedRows.push({ name: this.state.tutoringNeedSelected });
        }
        console.log(this.state);
    }

    /**
     * Add subject
     * @param{event} event - event
     */
    addNeedCategory(event){
        event.preventDefault();
        if(this.state.deliveryNeedSelected === 'other' && this.state.newneedcategory !== '')
        {
            this.pushToDatabase(this.state.newneedcategory, 'delivery');
            this.state.deliveryCategories.push({ category: this.state.newneedcategory });
            this.state.deliveryNeeds[[this.state.newneedcategory]] = { details: '', preference: 1 };
            this.state.deliveryNeedRows.push({ name: this.state.newneedcategory });
        }
        else{
            this.state.deliveryNeeds[[this.state.deliveryNeedSelected]] = { details: '', preference: 1 };
            this.state.deliveryNeedRows.push({ name: this.state.deliveryNeedSelected });
        }
        console.log(this.state);
        
    }

    /**
     * Add subject
     * @param{event} event - event
     */
    addDeliveryCategory(event){
        event.preventDefault();
        if(this.state.deliveryselected === 'other' && this.state.newdelivery !== '')
        {
            this.pushToDatabase(this.state.newdelivery, 'delivery');
            this.state.deliveryCategories.push({ category: this.state.newdelivery });
            this.state.delivery[[this.state.newdelivery]] = { details: '', preference: 1 };
            this.state.deliveryRows.push({ name: this.state.newdelivery });
        }
        else{
            this.state.delivery[[this.state.deliveryselected]] = { details: '', preference: 1 };
            this.state.deliveryRows.push({ name: this.state.deliveryselected });
        }
        console.log(this.state);
        
    }

    /**
     * runs when component will mount
     */
    async componentWillMount() {
        this.renderDropdown('tutoringSubjects');
        console.log('Getting delivery categories');
        this.renderDropdown('deliveryCategories');
    }

    /**
    * Fetches options from database
    * @param {string} key - key for service
    */
    async renderDropdown(key) {
        console.log('Getting subjects');
        const { status, responseText } = await XHRpromise('GET', API + '?service=' + key);
    
        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect.');
            default:
                throw new Error('Unknown error occurred.');
        }

        console.log('Finished GET request');
        console.log('tutoring subjects:');

        this.setState({ [key]: JSON.parse(responseText) });
        
        console.log(JSON.parse(responseText));

    }

    /**
     * Handles tutoring form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onTutoringChange(name, value) {
        if(name.includes('/'))
        {
            var split = name.split('/');
            console.log('Changing');
            console.log(split);
            console.log(this.state.tutoring[[split[0]]]);
            this.state.tutoring[[split[0]]][[split[1]]] = value;
        }
        else{
            this.state.tutoring[[name]] = value;
        }
        
        this.onChange('tutoring', this.state.tutoring);
    }

    /**
     * Handles tutoring form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onTutoringNeedsChange(name, value) {
        if(name.includes('/'))
        {
            var split = name.split('/');
            this.state.tutoringNeeds[[split[0]]][[split[1]]] = value;
        }
        else{
            this.state.tutoringNeeds[[name]] = value;
        }
        this.onChange('tutoringNeeds', this.state.tutoringNeeds);
    }

    /**
     * Handles delivery form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onDeliveryNeedsChange(name, value) {
        if(name.includes('/'))
        {
            var split = name.split('/');
            this.state.deliveryNeeds[[split[0]]][[split[1]]] = value;
        }
        else{
            this.state.deliveryNeeds[[name]] = value;
        }
        this.onChange('deliveryNeeds', this.state.deliveryNeeds);
    }
    /**
     * Handles delivery form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onDeliveryChange(name, value) {
        // eslint-disable-next-line react/no-direct-mutation-state
        if(name.includes('/'))
        {
            var split = name.split('/');
            this.state.delivery[[split[0]]][[split[1]]] = value;
        }
        else{
            this.state.delivery[[name]] = value;
        }
        this.onChange('delivery', this.state.delivery);
    }

    // eslint-disable-next-line require-jsdoc
    Other(props){
        const { type } = props;
        if(type === 'tutoring')
        {
            console.log('changing tutoring');
            if (props.need){
                return (<div>
                    { (this.state.tutoringNeedSelected === 'other' || this.state.tutoringNeedSelected === '') ? 
                        <LabeledInput
                            type="text"
                            label="New subject"
                            value={this.state.newneedsubject}
                            onChange={this.handleChange(this.onChange, 'newneedsubject')}
                        >
                        </LabeledInput>
                        :
                        <div></div>
                    }
                </div>);
            }
            return (<div>
                { (this.state.selected === 'other' || this.state.selected === '') ? 
                    <LabeledInput
                        type="text"
                        label="New subject"
                        value={this.state.newsubject}
                        onChange={this.handleChange(this.onChange, 'newsubject')}
                    >
                    </LabeledInput>
                    :
                    <div></div>
                }
            </div>);
        }
        if(props.need)
        {
            return (<div>
                { (this.state.deliveryNeedSelected === 'other' || this.state.deliveryNeedSelected === '') ? 
                    <LabeledInput
                        type="text"
                        label="New category"
                        value={this.state.newneedcategory}
                        onChange={this.handleChange(this.onChange, 'newneedcategory')}
                    >
                    </LabeledInput>
                    :
                    <div></div>
                }
            </div>);
        }
        return (<div>
            { (this.state.deliveryselected === 'other' || this.state.deliveryselected === '') ? 
                <LabeledInput
                    type="text"
                    label="New category"
                    value={this.state.newdelivery}
                    onChange={this.handleChange(this.onChange, 'newdelivery')}
                >
                </LabeledInput>
                :
                <div></div>
            }
        </div>);
    }


    // eslint-disable-next-line require-jsdoc
    removeFromTutoring(key, value){
        console.log(value);
        // eslint-disable-next-line no-unused-vars
        var newrows = this.state.tutoringRows.filter(function(value, index, arr){
            return value.name !== key;
        });
        this.setState({ tutoringRows: newrows });
        console.log('removed');
        // eslint-disable-next-line react/no-direct-mutation-state
        // eslint-disable-next-line no-undefined
        delete this.state.tutoring[[key]];
        console.log(this.state);
    }

    // eslint-disable-next-line require-jsdoc
    removeFromTutoringNeeds(key, value){
        console.log(value);
        // eslint-disable-next-line no-unused-vars
        var newrows = this.state.tutoringNeedRows.filter(function(value, index, arr){
            return value.name !== key;
        });
        this.setState({ tutoringNeedRows: newrows });
        console.log('removed');
        // eslint-disable-next-line react/no-direct-mutation-state
        // eslint-disable-next-line no-undefined
        delete this.state.tutoringNeeds[[key]];
        console.log(this.state);
    }

    // eslint-disable-next-line require-jsdoc
    removeFromDeliveryNeeds(key, value){
        console.log(value);
        // eslint-disable-next-line no-unused-vars
        var newrows = this.state.deliveryNeedRows.filter(function(value, index, arr){
            return value.name !== key;
        });
        this.setState({ deliveryNeedRows: newrows });
        console.log('removed');
        // eslint-disable-next-line react/no-direct-mutation-state
        // eslint-disable-next-line no-undefined
        delete this.state.deliveryNeeds[[key]];
        console.log(this.state);
    }

    // eslint-disable-next-line require-jsdoc
    removeFromDelivery(key, value){
        console.log(value);
        // eslint-disable-next-line no-unused-vars
        var newrows = this.state.deliveryRows.filter(function(value, index, arr){
            return value.name !== key;
        });
        this.setState({ deliveryRows: newrows });
        console.log('removed');
        // eslint-disable-next-line react/no-direct-mutation-state
        // eslint-disable-next-line no-undefined
        delete this.state.delivery[[key]];
        console.log(this.state);
    }

    /**
     * A single subject object
     * @param {props} props - props
     * @returns {Component} - renders new subject
     */
    Subject(props) {
        if (props.need)
        {
            console.log('Creating subject');
            return <form>
                <section>
                    <LabeledInput
                        type="text"
                        label={props.name}
                        disabled={this.state.disabled}
                        maxLength={TEXT_MAXLEN}
                        required={false}
                        value={ this.state.tutoringNeeds[props.name]['details'] }
                        onChange={this.handleChange(this.onTutoringNeedsChange, props.name + '/details')}
                    >
                    </LabeledInput>
                    <LabeledInput
                        type="number"
                        label={'Please rate your need for this subject.'}
                        min={1}
                        max={5}
                        disabled={this.state.disabled}
                        required={false}
                        value={ this.state.tutoringNeeds[props.name]['preference']}
                        onChange={ this.handleChange(this.onTutoringNeedsChange, props.name + '/preference')}
                    >
                    </LabeledInput>
                    <button onClick={this.handleChange(this.removeFromTutoringNeeds, props.name)}>Remove</button>
                </section>
            </form>;
        }
        return <form>
            <section>
                <LabeledInput
                    type="text"
                    label={props.name}
                    disabled={this.state.disabled}
                    maxLength={TEXT_MAXLEN}
                    required={false}
                    value={ this.state.tutoring[props.name]['details'] }
                    onChange={this.handleChange(this.onTutoringChange, props.name + '/details')}
                >
                </LabeledInput>
                <LabeledInput
                    type="number"
                    label={'Please rate your skill in this subject.'}
                    min={1}
                    max={5}
                    disabled={this.state.disabled}
                    required={false}
                    value={ this.state.tutoring[props.name]['rating']}
                    onChange={ this.handleChange(this.onTutoringChange, props.name + '/rating')}
                >
                </LabeledInput>
                <LabeledInput
                    type="number"
                    label={'Please rate how much you like this subject.'}
                    min={1}
                    max={5}
                    disabled={this.state.disabled}
                    required={false}
                    value={ this.state.tutoring[props.name]['preference']}
                    onChange={ this.handleChange(this.onTutoringChange, props.name + '/preference')}
                >
                </LabeledInput>
                <button onClick={this.handleChange(this.removeFromTutoring, props.name)}>Remove</button>
            </section>
        </form>;
    }

    /**
     * A single category object
     * @param {props} props - props
     * @returns {Component} - renders new category
     */
    Category(props) {
        if(props.need){
            return <form>
                <section>
                    <LabeledInput
                        type="text"
                        label={props.name}
                        disabled={this.state.disabled}
                        maxLength={TEXT_MAXLEN}
                        required={false}
                        value={ this.state.deliveryNeeds[props.name]['details'] }
                        onChange={this.handleChange(this.onDeliveryNeedsChange, props.name + '/details')}
                    >
                    </LabeledInput>
                    <LabeledInput
                        type="number"
                        label={'Please rate how much you need this item.'}
                        min={1}
                        max={5}
                        disabled={this.state.disabled}
                        required={false}
                        value={ this.state.deliveryNeeds[props.name]['preference']}
                        onChange={ this.handleChange(this.onDeliveryNeedsChange, props.name + '/preference')}
                    >
                    </LabeledInput>
                    
                    <button onClick={this.handleChange(this.removeFromDeliveryNeeds, props.name)}>Remove</button>
                </section>
            </form>;
        }
        return <form>
            <section>
                <LabeledInput
                    type="text"
                    label={props.name}
                    disabled={this.state.disabled}
                    maxLength={TEXT_MAXLEN}
                    required={false}
                    value={ this.state.delivery[props.name]['details'] }
                    onChange={this.handleChange(this.onDeliveryChange, props.name + '/details')}
                >
                </LabeledInput>
                <LabeledInput
                    type="number"
                    label={'Please rate how much you would prefer to deliver this item.'}
                    min={1}
                    max={5}
                    disabled={this.state.disabled}
                    required={false}
                    value={ this.state.delivery[props.name]['preference']}
                    onChange={ this.handleChange(this.onDeliveryChange, props.name + '/preference')}
                >
                </LabeledInput>
                <button onClick={this.handleChange(this.removeFromDelivery, props.name)}>Remove</button>
            </section>
        </form>;
    }

    /**
     * Creates dropdown with subjects. 
     * @param{props} props - true if this is a need
     * @returns {Component} component - x
     */
    SubjectsDropdown(props) {
        const { need } = props;
        console.log(this.state);
        var subjects = this.state.tutoringSubjects;

        console.log('new subjects');
        var newsubjects = new Array(subjects.length);
        for (let i = 0; i < subjects.length; i++)
        {
            newsubjects[i] = subjects[i]['subject'];
        }

        console.log(newsubjects);

        console.log('Making dropdown');
        if (need)
        {
            return (
                <div>
                    <select onChange={this.handleChange(this.onChange, 'tutoringNeedSelected')}>
                        <option value={'other'}> Other </option>
                        {newsubjects.map((x) => {
                            return <option key={x} value={x}> {x} </option>;
                        })}
                    </select>
                    <this.Other type={'tutoring'} need={true}/>
                </div>
            );
        }
        return (
            <div>
                <select onChange={this.handleChange(this.onChange, 'selected')}>
                    <option value={'other'}> Other </option>
                    {newsubjects.map((x) => {
                        return <option key={x} value={x}> {x} </option>;
                    })}
                </select>
                <this.Other type={'tutoring'} need={false}/>
            </div>
        );
    }

    /**
     * Creates dropdown with categories. 
     * @param{props} props - the component props
     * @returns {Component} component - 
     */
    DeliveryDropdown(props) {
        console.log(this.state);
        const { need } = props;
        var categories = this.state.deliveryCategories;

        console.log('new categories');
        var newcategories = new Array(categories.length);
        for (let i = 0; i < categories.length; i++)
        {
            newcategories[i] = categories[i]['category'];
        }

        console.log(newcategories);

        console.log('Making dropdown');
        if(need)
        {
            return (
                <div>
                    <select onChange={this.handleChange(this.onChange, 'deliveryNeedSelected')}>
                        <option value={'other'}> Other </option>
                        {newcategories.map((x) => {
                            return <option key={x} value={x}> {x} </option>;
                        })}
                    </select>
                    <this.Other type={'delivery'} need={true}/>
                </div>
            );
        }
        return (
            <div>
                <select onChange={this.handleChange(this.onChange, 'deliveryselected')}>
                    <option value={'other'}> Other </option>
                    {newcategories.map((x) => {
                        return <option key={x} value={x}> {x} </option>;
                    })}
                </select>
                <this.Other type={'delivery'} need={false}/>
            </div>
        );
    }

    // eslint-disable-next-line require-jsdoc
    SubjectList(props){
        const { need } = props;
        var rows = need ? this.state.tutoringNeedRows : this.state.tutoringRows;
        console.log(rows);
        if(need ? this.state.tutoringNeedRows : this.state.tutoringRows !== [])
        {
            console.log('subject list creation');
            return(
                <div>
                    {rows.map((subject) => {
                        return (
                            <this.Subject key={subject.name} name={subject.name} need={need}/>
                        );
                    })}
                </div>  
            );
        }
    }

    // eslint-disable-next-line require-jsdoc
    DeliveryList(props){
        var rows = props.need ? this.state.deliveryNeedRows : this.state.deliveryRows;
        console.log(rows);
        if(props.need ? this.state.deliveryNeedRows : this.state.deliveryRows !== [])
        {
            console.log('delivery list creation');
            return(
                <div>
                    {rows.map((subject) => {
                        return (
                            <this.Category key={subject.name} name={subject.name} need={props.need}/>
                        );
                    })}
                </div>  
            );
        }
    }

    /**
     * Renders the component.
     *
     * @returns {ReactElement} The component's elements.
     */
    render() {
        const { loading, error, profile } = this.state;
        if (loading) {
            return <Spinner />;
        }

        if (error) {
            return <div>
                <h1>404 - Not Found</h1>
                <p>The user &quot;{this.props.id}&quot; does not exist.</p>
            </div>;
        }

        const {
            nameFirst,
            nameLast,
            bio,
            ...profileAttrs
        } = profile;

        const attrs = Object.keys(ATTRS).map(function(key) {
            const attr = profileAttrs[key];
            if (!attr) {
                return;
            }

            return <ProfileAttr key={key} {...ATTRS[key]}>
                {attr}
            </ProfileAttr>;
        });

        /*const matches = matchIDs
            ? matchIDs.map(id => {
                return <li key={id}>
                    <Profile key={id} id={id} />
                </li>;
            })
            : null;*/

        return <div className={styles.profile}>
            <h2 className={styles.title}>
                {nameFirst} {nameLast}
            </h2>
            <ul>{attrs}</ul>
            {bio && <h3>About me</h3>}
            {bio && <p className={styles.bio}>{bio}</p>}
            <form>
                <section>
                    <div>
                        <h3> Skills </h3>
                        <h4> Tutoring  </h4>
                    </div>
                    <div>
                        <this.SubjectsDropdown need={false}/>
                        <button onClick={this.addSubject} disabled={this.state.disabled}>Add Subject</button>
                        <this.SubjectList need={false}/>
                        <label> How far are you willing to go to tutor someone?</label>
                        <select value={this.state.tutoring['timetotutor']} onChange={ this.handleChange(this.onTutoringChange, 'timetotutor')} >
                            <option value={5}>5 minutes away</option>
                            <option value={10}>10 minutes away</option>
                            <option value={15}>15 minutes away</option>
                            <option value={20}>20 minutes away</option>
                            <option value={30}>30 minutes away</option>
                        </select>
                    </div>
                </section>
                <section>
                    <div>
                        <h4> Delivery </h4>
                        <this.DeliveryDropdown need={false}/>
                        <button onClick ={this.addDeliveryCategory} disabled={this.state.disabled}>Add Category</button>
                        <this.DeliveryList need={false}/>
                        <label> How far are you willing to go to pick up items that need to be delivered?</label>
                        <select value={this.state.delivery['timetopickup']} onChange={ this.handleChange(this.onDeliveryChange, 'timetopickup')} >
                            <option value={5}>5 minutes away</option>
                            <option value={10}>10 minutes away</option>
                            <option value={15}>15 minutes away</option>
                            <option value={20}>20 minutes away</option>
                            <option value={30}>30 minutes away</option>
                        </select>
                        <label> How far are you willing to go to deliver items?</label>
                        <select value={this.state.delivery['timetodeliver']} onChange={ this.handleChange(this.onDeliveryChange, 'timetodeliver')} >
                            <option value={5}>5 minutes away</option>
                            <option value={10}>10 minutes away</option>
                            <option value={15}>15 minutes away</option>
                            <option value={20}>20 minutes away</option>
                            <option value={30}>30 minutes away</option>
                        </select>
                    </div>
                </section>
                <section>
                    <div>
                        <h3> Needs </h3>
                        <h4> Tutoring  </h4>
                    </div>
                    <div>
                        <this.SubjectsDropdown need={true}/>
                        <button onClick={this.addNeedSubject} disabled={this.state.disabled}>Add Subject</button>
                        <this.SubjectList need={true}/>
                        <label>How far are you willing to go to get tutored?</label>
                        <select value={this.state.tutoringNeeds['timetogettutored']} onChange={ this.handleChange(this.onTutoringNeedsChange, 'timetogettutored')} >
                            How far are you willing to go to get tutored?
                            <option value={5}>5 minutes away</option>
                            <option value={10}>10 minutes away</option>
                            <option value={15}>15 minutes away</option>
                            <option value={20}>20 minutes away</option>
                            <option value={30}>30 minutes away</option>
                        </select>
                    </div>
                </section>
                <section>
                    <div>
                        <h4> Delivery </h4>
                        <this.DeliveryDropdown need={true}/>
                        <button onClick ={this.addNeedCategory} disabled={this.state.disabled}>Add Category</button>
                        <this.DeliveryList need={true}/>
                        <label> How far are you willing to go to pick up your items?</label>
                        <select value={this.state.deliveryNeeds['timetopickup']} 
                            onChange={ this.handleChange(this.onDeliveryNeedsChange, 'timetopickup')} >
                            <option value={5}>5 minutes away</option>
                            <option value={10}>10 minutes away</option>
                            <option value={15}>15 minutes away</option>
                            <option value={20}>20 minutes away</option>
                            <option value={30}>30 minutes away</option>
                        </select>
                    </div>
                </section>
                <h4>Tell us more about yourself:</h4>
                <textarea
                    maxLength={TEXTAREA_MAXLEN}
                    placeholder="Anything else to share?"
                    value={this.state.bio === null ? '' : this.state.bio}
                    onChange={this.handleChange(this.onChange, 'bio')}
                />
            </form>
            <button onClick={this.onEditClick}> {this.state.disabled ? 'Edit Profile' : 'Save Changes' } </button>
        </div>;
    }
}

Profile.propTypes = {
    id: string.isRequired
};

export default Profile;

