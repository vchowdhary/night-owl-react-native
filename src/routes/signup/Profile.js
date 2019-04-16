/* eslint-disable react/no-direct-mutation-state */
/* eslint-disable no-invalid-this */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/**
 * Profile form.
 *
 * @module src/routes/signup/Profile
 */

import React from 'react';
import { bool, object, func } from 'prop-types';
import LabeledInput from '../../LabeledInput';

//import { Group as ScaleInputGroup } from 'src/ScaleInput';

//import logoImage from 'public/images/logo-notext.svg';
import XHRpromise from '../../XHRpromise';

const API = '/api/subjects';

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
 * Profile form.
 *
 * @alias module:src/routes/signup/Profile
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
class SignupProfile extends React.Component {
    /**
     * Initializes the component.
     *
     * @param {Object} props - The component's props.
     */
    constructor(props) {
        super(props);
        this.state = {
            disabled: props.disabled,
            tutoring: props.tutoring,
            delivery: props.delivery,
            tutoringSubjects: {},
            tutoringRows: [],
            tutoringNeedRows: [],
            deliveryCategories: {},
            deliveryRows: [],
            deliveryNeedRows: [],
            selected: '',
            newsubject: '',
            newneedsubject: '',
            deliveryselected: '',
            newdelivery: '',
            tutoringNeedSelected: '',
            deliveryNeedSelected: '',
            newneedcategory: '',
            tutoringNeeds: props.tutoringNeeds,
            deliveryNeeds: props.deliveryNeeds
        };

        [
            'onTutoringChange',
            'onChange',
            'handleChange',
            'SubjectsDropdown',
            'renderDropdown',
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
            'addNeedCategory'
        ].forEach(key => {
            this[key] = this[key].bind(this);
        });
        
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
            this.state.tutoring[[this.state.newsubject]] = { details: '', rating: 1, timetotutor: 0, preference: 1 };
            this.state.tutoringRows.push({ name: this.state.newsubject });
        }
        else{
            this.state.tutoring[[this.state.selected]] = { details: '', rating: 1, timetotutor: 0, preference: 1 };
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
            this.state.tutoringNeeds[[this.state.newneedsubject]] = { details: '', timetogettutored: 0, preference: 1 };
            this.state.tutoringNeedRows.push({ name: this.state.newneedsubject });
        }
        else{
            this.state.tutoringNeeds[[this.state.tutoringNeedSelected]] = { details: '', timetogettutored: 0, preference: 1 };
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
            this.state.deliveryNeeds[[this.state.newneedcategory]] = { details: '', timetopickup: 0, preference: 1 };
            this.state.deliveryNeedRows.push({ name: this.state.newneedcategory });
        }
        else{
            this.state.deliveryNeeds[[this.state.deliveryNeedSelected]] = { details: '', timetopickup: 0, preference: 1 };
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
            this.state.delivery[[this.state.newdelivery]] = { details: '', timetopickup: 0, timetodeliver: 0, preference: 1 };
            this.state.deliveryRows.push({ name: this.state.newdelivery });
        }
        else{
            this.state.delivery[[this.state.deliveryselected]] = { details: '', timetopickup: 0, timetodeliver: 0, preference: 1 };
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
     * Handles changes in form data.
     *
     * @private
     * @param {string} key - The changed key.
     * @param {*} value - The new value.
     */
    onChange(key, value) {
        this.setState({ [key]: value });
        console.log(this.state);
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
            this.state.tutoring[[split[0]]][[split[1]]] = value;
            this.onChange('tutoring', this.state.tutoring);
        }
        else{
            this.state.tutoring[[name]] = value;
            this.onChange('tutoring', this.state.tutoring);
        }
        
    }

    /**
     * Handles tutoring form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onTutoringNeedsChange(name, value) {
        if(name.includes('/')){
            var split = name.split('/');
            this.state.tutoringNeeds[[split[0]]][[split[1]]] = value;
            this.onChange('tutoringNeeds', this.state.tutoringNeeds);
        }
        else{
            this.state.tutoringNeeds[[name]] = value;
            this.onChange('tutoringNeeds', this.state.tutoringNeeds);
        }
        
    }

    /**
     * Handles delivery form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onDeliveryNeedsChange(name, value) {
        // eslint-disable-next-line react/no-direct-mutation-state
        if (name.includes('/')){
            var split = name.split('/');
            this.state.deliveryNeeds[[split[0]]][[split[1]]] = value;
            this.onChange('deliveryNeeds', this.state.deliveryNeeds);
        }
        else{
            this.state.deliveryNeeds[[name]] = value;
            this.onChange('deliveryNeeds', this.state.deliveryNeeds);
        }
    }

    /**
     * Handles delivery form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onDeliveryChange(name, value) {
        if(name.includes('/')){
            var split = name.split('/');
            this.state.delivery[[split[0]]][[split[1]]] = value;
            this.onChange('delivery', this.state.delivery);
        }
        else{
            this.state.delivery[[name]] = value;
            this.onChange('delivery', this.state.delivery);
        }
        
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
        //console.log(typeof (subjects));
        
        /*subjects = subjects.map(function(x) {
            return x.subject;
        });*/

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
        return <form>
            <section>
                <img src={logoImage} />
                <div>
                    <h4>Now, let&rsquo;s get personal.</h4>
                    <h5>
                        Please tell us about your skills.
                    </h5>
                </div>
            </section>
            <section>
                <div>
                    <h3> Tutoring </h3>
                    <h4> Please describe your knowledge of the following subjects.
                        Select from the dropdown and click add to enter the subject and your details.  </h4>
                </div>
                <div>
                    <this.SubjectsDropdown need={false}/>
                    <button onClick={this.addSubject}>Add Subject</button>
                    <this.SubjectList need={false}/>
                    <label> How far are you willing to go to tutor someone?</label>
                    <select onChange={ this.handleChange(this.onTutoringChange, 'timetotutor')} >
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
                    <h3> Delivery </h3>
                    <h4> Select the things you would like to deliver.  </h4>
                    <this.DeliveryDropdown need={false}/>
                    <button onClick ={this.addDeliveryCategory}>Add Category</button>
                    <this.DeliveryList need={false}/>
                    <label> How far are you willing to go to pick up items that need to be delivered?</label>
                    <select onChange={ this.handleChange(this.onDeliveryChange, 'timetopickup')} >
                        <option value={5}>5 minutes away</option>
                        <option value={10}>10 minutes away</option>
                        <option value={15}>15 minutes away</option>
                        <option value={20}>20 minutes away</option>
                        <option value={30}>30 minutes away</option>
                    </select>
                    <label> How far are you willing to go to deliver items?</label>
                    <select onChange={ this.handleChange(this.onDeliveryChange, 'timetodeliver')} >
                        <option value={5}>5 minutes away</option>
                        <option value={10}>10 minutes away</option>
                        <option value={15}>15 minutes away</option>
                        <option value={20}>20 minutes away</option>
                        <option value={30}>30 minutes away</option>
                    </select>
                    
                </div>
            </section>
            <section>
                <img src={logoImage} />
                <div>
                    <h5>
                        Please tell us about your needs.
                    </h5>
                </div>
            </section>
            <section>
                <div>
                    <h3> Tutoring </h3>
                    <h4> Please describe your needs of tutoring in the following subjects, if applicable.
                        Select from the dropdown and click add to enter the subject and any additional details.  </h4>
                </div>
                <div>
                    <this.SubjectsDropdown need={true}/>
                    <button onClick={this.addNeedSubject}>Add Subject</button>
                    <this.SubjectList need={true}/>
                    <label>How far are you willing to go to get tutored?</label>
                    <select onChange={ this.handleChange(this.onTutoringNeedsChange, 'timetogettutored')} >
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
                    <h3> Delivery </h3>
                    <h4> Select the things you expect to need someone to deliver.  </h4>
                    <this.DeliveryDropdown need={true}/>
                    <button onClick ={this.addNeedCategory}>Add Category</button>
                    <this.DeliveryList need={true}/>
                    <label> How far are you willing to go to pick up your items?</label>
                    <select onChange={ this.handleChange(this.onDeliveryNeedsChange, 'timetopickup')} >
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
                onChange={this.handleChange(this.onChange, 'bio')}
            />
        </form>;
    }
}



SignupProfile.propTypes = {
    disabled: bool,
    onChange: func.isRequired,
    tutoring: object.isRequired,
    moving: bool,
    delivery: bool
};

export default hot(module)(SignupProfile);

