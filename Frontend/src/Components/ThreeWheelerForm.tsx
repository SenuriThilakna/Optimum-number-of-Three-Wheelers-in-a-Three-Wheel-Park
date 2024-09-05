import React, { useState } from 'react';
import { Form, Select, InputNumber, TimePicker, Button, message } from 'antd';
import styled from 'styled-components';

const { Option } = Select;
const { RangePicker } = TimePicker;

interface ThreeWheelerFormData {
  location: string;
  parkingBays: number;
  weather: string;
  dayType: string;
  timeRange: [string, string];
}

const FormWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto 20px;
  padding: 20px;
  background-color: #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  color: #00008B;  // Dark blue font color

  .ant-form-item-label > label {
    color: #00008B;  // Dark blue for labels
    font-weight: 600;
    font-size: 18px;
  }

  .ant-select-selector,
  .ant-picker,
  .ant-input-number,
  .ant-select-selection-item {
    border-radius: 4px;
    font-size: 16px;
    font-weight: normal;  // Changed to normal
    border-color: #ADD8E6 !important;  // Light blue border
  }

  .ant-select-selector {
    border-color: #ADD8E6 !important;  // Light blue border for select
  }

  .ant-select-selection-item,
  .ant-input-number-input,
  .ant-picker-input > input {
    color: black;  // Changed to black
    font-weight: normal;  // Changed to normal
  }

  // Ensure placeholder text is dark blue
  ::placeholder,
  ::-webkit-input-placeholder {
    color: #00008B !important;
    opacity: 0.7;
  }
  :-ms-input-placeholder {
    color: #00008B !important;
    opacity: 0.7;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormColumn = styled.div`
  flex: 1;
`;

const OutputWrapper = styled.div`
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: #00008B;
    font-weight: 600;
    font-size: 18px;
  }
`;

const ThreeWheelerForm: React.FC = () => {
  const [form] = Form.useForm<ThreeWheelerFormData>();
  const [numberOfThreewheelers, setNumberOfThreewheelers] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ThreeWheelerFormData) => {
    console.log(values)
    setLoading(true);
    try {
      // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setNumberOfThreewheelers(data.prediction);

      const parkingBays = values.parkingBays;
      if (data.prediction > parkingBays) {
        setNumberOfThreewheelers(parkingBays);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to get the number of three-wheelers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormWrapper>
        <Form<ThreeWheelerFormData>
          form={form}
          name="threeWheelerForm"
          onFinish={onFinish}
          layout="vertical"
        >
          <FormRow>
            <FormColumn>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Select>
                  <Option value="urban">Urban</Option>
                  <Option value="rural">Rural</Option>
                  <Option value="near-junction">Near junction</Option>
                </Select>
              </Form.Item>
            </FormColumn>
            <FormColumn>
              <Form.Item name="parkingBays" label="Parking Bays" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <Form.Item name="weather" label="Weather" rules={[{ required: true }]}>
                <Select>
                  <Option value="normal">Normal</Option>
                  <Option value="rainy">Rainy</Option>
                </Select>
              </Form.Item>
            </FormColumn>
            <FormColumn>
              <Form.Item name="dayType" label="Day Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="weekday">Weekday</Option>
                  <Option value="weekend">Weekend</Option>
                </Select>
              </Form.Item>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <Form.Item name="timeRange" label="Time Range" rules={[{ required: true }]}>
                <RangePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </FormColumn>
            <FormColumn>
              {/* Placeholder for balance */}
            </FormColumn>
          </FormRow>

          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form>
      </FormWrapper>

      <OutputWrapper>
        <h3>Optimum Number of Three-wheelers: {numberOfThreewheelers !== null ? numberOfThreewheelers : 0}</h3>
      </OutputWrapper>
    </>
  );
};

export default ThreeWheelerForm;