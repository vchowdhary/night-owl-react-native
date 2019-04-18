// Formik x React Native example
import React from 'react';
import { Button, TextInput, View } from 'react-native';
import { Formik } from 'formik';
import {Input, Label} from 'react-native-elements';

export default class MyReactNativeForm extends React.Component {
    constructor(props)
    {
        super(props);
    }
    render(){
        return(
            <Formik
            initialValues={{ email: '' }}
            onSubmit={values => console.log(values)}
            >
                {props => (
                <View>
                    <TextInput
                        onChangeText={props.handleChange('email')}
                        onBlur={props.handleBlur('email')}
                        value={props.values.email}
                        label='email'
                    />
                    <Button onPress={props.handleSubmit} title="Submit" />
                </View>
                )}
            </Formik>
        );
    }
}