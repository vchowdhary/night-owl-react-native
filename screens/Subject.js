import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    ActivityIndicator,
    Alert,
    Picker,
    FlatList
  } from 'react-native';
  import {Button, Label, Input, Text} from 'react-native-elements';
  import RNPickerSelect from 'react-native-picker-select';

export default class Subject extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            rating: 0,
            preference: 0,
            details: '',
            selected: 0,
        }
    }

    render()
    {
        console.log("Creating Subject");
        const numbers = [1, 2, 3, 4, 5].map((x) => {
            return {label: x, value: x};
        });
        const { name } = this.props;
        const placeholder = {
            label: 'Please rate your skill in this subject...',
            value: null,
            color: '#9EA0A4',
          };
        return(
            <View>
            <Text h3>{name}</Text>
            <Label>RATE YOUR SKILL IN {name}</Label>
            <RNPickerSelect
                placeholder={placeholder}
                items={numbers}
                onValueChange={value => {
                this.setState({rating: value});
                }}
                value={this.state.selected}
                style={{
                ...pickerSelectStyles,
                placeholder: {
                    color: 'gray',
                    fontSize: 12,
                    fontWeight: 'bold',
                },
                }}
            />
            </View>
        );
    }
    
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });