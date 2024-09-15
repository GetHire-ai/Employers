import React, { useEffect, useState } from "react";
import { GetApi, PostApi } from "Api/Api_Calling";
import OnboardingSteps from "./OnboardingSteps";
import {
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";

const steps = [
  "Personal Information",
  "Employment Details",
  "Document Submission",
  "Access & IT Setup",
  "Orientation & Training",
  "Team Integration",
  "Company Policies & Benefits",
  "Offer Letter Template Selection",
  "Onboarding Completion",
];

const Index = () => {
  const location = useLocation();
  const { state } = location;
  const [allJobs, setAllJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("");

  const getOnboarding = async () => {
    try {
      const res = await GetApi(
        `api/CompanyRoutes/get-onboarding/${state.jobId}/${state.studentId}/${state.companyId}`
      );
      setOnboardingData(res?.data?.data || {});
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err.response);
    } finally {
      setLoading(false);
    }
  };
  const updateOnboarding = async (data) => {
    try {
      const res = await PostApi(
        `api/CompanyRoutes/update-onboarding/${onboardingData._id}`,
        data
      );
      console.error(res);
    } catch (err) {
      // setError("Failed to update data");
      console.error(err.response);
    } finally {
      setLoading(false);
    }
  };
  const getAllJobs = async () => {
    try {
      const res = await GetApi("api/CompanyRoutes/GetAllJobswithApplication");
      setAllJobs(res?.data?.data || []);
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleJobChange = (event, newValue) => {
    setSelectedJob(newValue);
    console.log("Selected job:", newValue);
  };

  useEffect(() => {
    setStep(steps[0]);
    getAllJobs();
    getOnboarding();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "85vh",
        minWidth: "100%",
        fontFamily: "poppins",
      }}
    >
      <Paper elevation={3} sx={{ width: 290, padding: 2, marginRight: 2 }}>
        {/* <Autocomplete
          options={allJobs.map((job) => ({
            label: job.positionName,
            id: job._id,
          }))}
          onChange={handleJobChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Job" variant="outlined" />
          )}
        /> */}
        <List>
          {steps.map((stepName, index) => (
            <ListItem button key={index} onClick={() => setStep(stepName)}>
              <ListItemText primary={stepName} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box flex={1}>
        <OnboardingSteps
          step={step}
          updateOnboarding={updateOnboarding}
          data={onboardingData}
        />
      </Box>
    </Paper>
  );
};

export default Index;