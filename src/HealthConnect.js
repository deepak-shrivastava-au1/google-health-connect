import React, { useState } from 'react';
import {
    Text,
    View
} from 'react-native';
import { StyleSheet } from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { Card } from 'react-native-elements'
/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */
export const Section = () => {
    const [dailySteps, setdailySteps] = useState(0);
    const [heartRate, setHeartRate] = useState(0);
    const [calories, setCalories] = useState(0);
    const [hydration, setHydration] = useState(0);
    const [sleep, setSleep] = useState(0);
    const [weight, setWeight] = useState(0);
    const [bloodPressure, setBloodPressure] = useState({});
    const [loading, setLoading] = useState(true);

    var today = new Date();
    var lastWeekDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 8,
    );
    const opt = {
        startDate: lastWeekDate.toISOString(), // required ISO8601Timestamp
        endDate: today.toISOString(), // required ISO8601Timestamp
        bucketUnit: 'DAY', // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
        bucketInterval: 1, // optional - default 1.
    };

    const options = {
        scopes: [
            Scopes.FITNESS_ACTIVITY_READ,
            Scopes.FITNESS_ACTIVITY_WRITE,
            Scopes.FITNESS_BODY_READ,
            Scopes.FITNESS_BODY_WRITE,
            Scopes.FITNESS_BLOOD_PRESSURE_READ,
            Scopes.FITNESS_BLOOD_PRESSURE_WRITE,
            Scopes.FITNESS_BLOOD_GLUCOSE_READ,
            Scopes.FITNESS_BLOOD_GLUCOSE_WRITE,
            Scopes.FITNESS_NUTRITION_WRITE,
            Scopes.FITNESS_SLEEP_READ,
        ],
    };
    GoogleFit.checkIsAuthorized().then(() => {
        var authorized = GoogleFit.isAuthorized;
        console.log(authorized);
        if (authorized) {
            // if already authorized, fetch data

        } else {
            // Authentication if already not authorized for a particular device
            GoogleFit.authorize(options)
                .then(authResult => {
                    if (authResult.success) {
                        console.log('AUTH_SUCCESS');
                        fetchStepsData(opt)
                        fetchHeartData(opt)
                        fetchCaloriesData(opt)
                        fetchSleepData(opt)
                        // if successfully authorized, fetch data
                    } else {
                        console.log('AUTH_DENIED ' + authResult.message);
                    }
                })
                .catch(() => {
                    dispatch('AUTH_ERROR');
                });
        }
    });

    // fetch daily steps
    let fetchStepsData = async opt => {
        const res = await GoogleFit.getDailyStepCountSamples(opt);
        if (res.length !== 0) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].source === 'com.google.android.gms:estimated_steps') {
                    let data = res[i].steps.reverse();
                    dailyStepCount = res[i].steps;
                    setdailySteps(data[0]?.value);
                }
            }
        } else {
            console.log('Not Found');
        }
    };
    // fetch heart rate 
    let fetchHeartData = async opt => {
        const res = await GoogleFit.getHeartRateSamples(opt);
        let data = res.reverse();
        if (data.length === 0) {
            setHeartRate('Not Found');
        } else {
            setHeartRate(data[0]?.value);
        }
    };
    // fetch calories 
    let fetchCaloriesData = async opt => {
        const res = await GoogleFit.getDailyCalorieSamples(opt);
        let data = res.reverse();
        if (data.length === 0) {
            setCalories('Not Found');
        } else {
            setCalories(Math.round(data[0]?.calorie * -1 * 100) / 100);
        }
    };
    // fetch sleeps
    let fetchSleepData = async opt => {
        var midnight = new Date();
        midnight.setHours(0, 0, 0, 0);
        sleepTotal = 0;
        const res = await GoogleFit.getSleepSamples(opt);

        for (var i = 0; i < res.length; i++) {
            if (new Date(res[i].endDate) > Date.parse(midnight)) {
                if (new Date(res[i].startDate) > Date.parse(midnight)) {
                    sleepTotal +=
                        Date.parse(res[i].endDate) - Date.parse(res[i].startDate);
                } else {
                    sleepTotal += Date.parse(res[i].endDate) - Date.parse(midnight);
                }
                if (
                    i + 1 < res.length &&
                    Date.parse(res[i].startDate) < Date.parse(res[i + 1].endDate)
                ) {
                    sleepTotal -=
                        Date.parse(res[i + 1].endDate) - Date.parse(res[i].startDate);
                }
            }
        }
        setSleep(Math.round((sleepTotal / (1000 * 60 * 60)) * 100) / 100);
    };
    return (
        <View style={styles.sectionContainer}>
            <Text>
                Andriod Health Connect
            </Text>
            <Card>
                <Card.Title>Steps</Card.Title>
                <Card.Divider />
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{dailySteps || 3234}</Text>
                </View>
            </Card>
            <Card>
                <Card.Title>Heart Rate</Card.Title>
                <Card.Divider />
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{heartRate || 104}</Text>
                </View>
            </Card>
            <Card>
                <Card.Title>Calories</Card.Title>
                <Card.Divider />
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{calories || 1234}</Text>
                </View>
            </Card>
            {/* <Card>
                <Card.Title>Blood Pressure</Card.Title>
                <Card.Divider />
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{bloodPressure || 120}</Text>
                </View>
            </Card> */}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 0,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center'
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});