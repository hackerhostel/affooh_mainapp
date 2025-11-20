import React, {useEffect, useState} from 'react';
import FormInput from "../../FormInput.jsx";
import ProgressBar from "../../ProgressBar.jsx";
import {calculateRemainingTime, getSpendTime, isValidEstimationFormat} from "../../../utils/commonUtils.js";
import FormInputWrapper from "./FormEditInputWrapper.jsx";

const TimeTracking = ({
                          initialEstimationAttribute = {},
                          timeLogs,
                          isEditing,
                          updateTaskAttribute,
                          taskFieldID,
                      }) => {
    const [spendTime, setSpendTime] = useState('');
    const [remainTime, setRemainTime] = useState({status: 'within', time: 'No Estimations', percentage: 0});
    const [estimation, setEstimation] = useState('');
    const [initialEstimation, setInitialEstimation] = useState('');
    const [formatError, setFormatError] = useState(false);

    useEffect(() => {
        if (timeLogs && timeLogs.length) {
            setSpendTime(getSpendTime(timeLogs))
        } else {
            setSpendTime('')
        }
    }, [timeLogs]);

    useEffect(() => {
        if (initialEstimation && initialEstimation !== '') {
            if (isValidEstimationFormat(initialEstimation)) {
                const calculatedTime = calculateRemainingTime(initialEstimation, spendTime)
                setRemainTime({
                    status: calculatedTime?.status || 'within',
                    time: calculatedTime?.time || '',
                    percentage: calculatedTime?.percentage || 0
                })
                setFormatError(false)
            } else {
                setFormatError(true)
                setRemainTime({status: 'within', time: '', percentage: 0})
            }
        } else {
            setRemainTime({status: 'within', time: 'No Estimations', percentage: 0})
            setFormatError(false)
        }
    }, [initialEstimation, spendTime]);

    useEffect(() => {
        if (estimation && estimation !== '') {
            if (isValidEstimationFormat(estimation)) {
                setFormatError(false)
            } else {
                setFormatError(true)
            }
        } else {
            setFormatError(false)
        }
    }, [estimation]);

    useEffect(() => {
        const value = initialEstimationAttribute?.values?.[0] || '';
        if (initialEstimationAttribute?.taskFieldID) {
            setInitialEstimation(value);
            setEstimation(value);
        } else {
            setInitialEstimation('');
            setEstimation('');
        }
    }, [initialEstimationAttribute]);

    return (
        <div className="w-full p-5 bg-white rounded-md mt-5 flex-col">
            <div className={"mb-6"}>
                <ProgressBar label="Time Tracking"
                             progress={remainTime?.percentage || 0}/>
            </div>
            <div className={"flex-col mb-6"}>
                <p className={"text-secondary-grey"}>Estimation</p>
                <FormInputWrapper
                    isEditing={isEditing}
                    initialData={{estimation: initialEstimation}}
                    currentData={{estimation: estimation}}
                    onAccept={() => updateTaskAttribute(taskFieldID, estimation)}
                    onReject={() => setEstimation(initialEstimation ? initialEstimation : '')}
                    actionButtonPlacement={"bottom"}
                    blockSave={formatError}
                >
                    <FormInput
                        type="text"
                        name="estimation"
                        formValues={{estimation: estimation}}
                        onChange={({target: {value}}) => setEstimation(value)}
                    />
                </FormInputWrapper>
                <div className={"mt-2 flex"}>
                    <p className={`${formatError ? 'text-red-600' : 'text-text-color'}`}>
                        {formatError ? 'Invalid | Use the format: 2w 4d 6h 45m' : 'Use the format: 2w 4d 6h 45m'}
                    </p>
                </div>
            </div>
            <div className="flex w-full justify-between mb-2 gap-5">
                <div className={"flex-col w-full"}>
                    <p className={"text-secondary-grey"}>Spend Time</p>
                    <FormInput
                        type="text"
                        name="spendTime"
                        formValues={{spendTime: spendTime}}
                        disabled={true}
                    />
                </div>
                <div className={"flex-col w-full"}>
                    <p className={"text-secondary-grey"}>{remainTime.status === 'over' ? 'Over Spent Time' : 'Remaining Time'}</p>
                    <FormInput
                        type="text"
                        name="remainingTime"
                        formValues={{remainingTime: remainTime?.time || ''}}
                        disabled={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default TimeTracking;
