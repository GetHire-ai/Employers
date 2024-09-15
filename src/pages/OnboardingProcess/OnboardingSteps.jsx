import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import axios from "axios";

const OnboardingSteps = ({ data, step, updateOnboarding }) => {
  const [formData, setFormData] = useState({
    fullName: data?.StudentId?.Name,
    contactInformation: data?.StudentId?.Number,
    emailInformation: data?.StudentId?.Email,
    residentialAddress: "",
    jobTitle: data?.JobId?.positionName,
    department: "",
    startDate: "",
    documentFiles: {
      employmentContract: null,
      nda: null,
      taxForms: null,
      panCard: null,
      aadharCard: null,
      salarySlip: null,
      bankStatement: null,
    },
    emailAccount: "",
    softwareAccess: "",
    orientationSchedule: null,
    roleSpecificTraining: null,
    teamIntroduction: "",
    reportingStructure: "",
    employeeHandbook: null,
    offerLetterTemplate: "",
  });

  useEffect(() => {
    console.log(data.StudentId);
    console.log(data.CompanyId);
    console.log(data.JobId);
  }, [])

  const formFields = {
    "Personal Information": [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        value: data?.fullName,
      },
      {
        name: "contactInformation",
        label: "Contact Information",
        type: "text",
      },
      {
        name: "emailInformation",
        label: "Email Information",
        type: "email",
      },
      {
        name: "residentialAddress",
        label: "Residential Address",
        type: "text",
      },
    ],
    "Employment Details": [
      { name: "jobTitle", label: "Job Title", type: "text" },
      { name: "department", label: "Department", type: "text" },
      { name: "startDate", label: "Start Date", type: "date" },
      { name: "salary", label: "Salary Offered", type: "number" },
      { name: "employmentContract", label: "Employment Contract", type: "file"},
      { name: "nda", label: "NDA", type: "file" },
      { name: "additionalDocument", label: "Additional Document", type: "file" },
    ],
    "Document Submission": [
      { name: "taxForms", label: "Tax Forms", type: "checkbox" },
      { name: "panCard", label: "PAN Card", type: "checkbox" },
      { name: "aadharCard", label: "Aadhar Card", type: "checkbox" },
      { name: "salarySlip", label: "Salary Slip", type: "checkbox" },
      { name: "bankStatement", label: "Bank Statement", type: "checkbox" },
    ],
    "Access & IT Setup": [
      { name: "emailAccount", label: "Company Email", type: "text" },
      { name: "softwareAccess", label: "Software Access", type: "text" },
    ],
    "Orientation & Training": [
      {
        name: "orientationSchedule",
        label: "Orientation Schedule",
        type: "file",
      },
      {
        name: "roleSpecificTraining",
        label: "Role-Specific Training",
        type: "file",
      },
      { name: "additionalDocument2", label: "Additional Document", type: "file" },
    ],
    "Team Integration": [
      { name: "teamIntroduction", label: "Team Introduction", type: "text" },
      {
        name: "reportingStructure",
        label: "Reporting Structure",
        type: "text",
      },
    ],
    "Company Policies & Benefits": [
      { name: "employeeHandbook", label: "Employee Handbook", type: "file" },
    ],
    "Offer Letter Template Selection": [
      {
        name: "offerLetterTemplate",
        label: "Offer Letter Template",
        type: "file",
        // options: [
        //   { value: "standard", label: "Standard Offer Letter" },
        //   { value: "executive", label: "Executive Offer Letter" },
        //   { value: "internship", label: "Internship Offer Letter" },
        //   { value: "contractual", label: "Contractual Offer Letter" },
        // ],
      },
    ],
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (event, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      documentFiles: {
        ...prevData.documentFiles,
        [fieldName]: event.target.files[0],
      },
    }));
  };

  // Handle form submission (save data)
  const handleSave = async () => {
    const formDataToSend = new FormData();
    // Append regular fields
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("contactInformation", formData.contactInformation);
    formDataToSend.append("EmailInformation", formData.emailInformation);
    formDataToSend.append("residentialAddress", formData.residentialAddress);
    formDataToSend.append("jobTitle", formData.jobTitle);
    formDataToSend.append("department", formData.department);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("salary", formData.startDate);
    formDataToSend.append("emailAccount", formData.emailAccount);
    formDataToSend.append("softwareAccess", formData.softwareAccess);
    formDataToSend.append("teamIntroduction", formData.teamIntroduction);
    formDataToSend.append("reportingStructure", formData.reportingStructure);
    formDataToSend.append("offerLetterTemplate", formData.offerLetterTemplate);

    // Append document files
    Object.keys(formData.documentFiles).forEach((key) => {
      if (formData.documentFiles[key]) {
        formDataToSend.append(key, formData.documentFiles[key]);
      }
    });
    updateOnboarding(formData);
  };

  const renderForm = () => {
    const fields = formFields[step] || [];
  
    return fields.map((field) => {
      // Text, Date, Email
      if (["text", "date", "email", "number"].includes(field.type)) {
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={formData[field.name]}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={
              field.type === "date" ? { shrink: true } : undefined
            }
          />
        );
      }
  
      // File Upload
      if (field.type === "file") {
        return (
          <Box key={field.name} mb={2}>
            <Typography>{field.label}</Typography>
            <TextField
              type="file"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleFileChange(e, field.name)}
              variant="outlined"
            />
          </Box>
        );
      }
  
      // Select Dropdown
      if (field.type === "select") {
        return (
          <FormControl key={field.name} fullWidth margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
            >
              {field.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }
      
  
      // Checkbox Toggle
      if (field.type === "checkbox") {
        return (
          <Box key={field.name} display="flex" justifyContent="center" mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData[field.name] || false}
                  onChange={(e) =>
                    handleChange({ target: { name: field.name, value: e.target.checked } })
                  }
                  name={field.name}
                  color="primary"
                />
              }
              label={field.label}
              style={{ display: 'block', textAlign: 'center' }} // This ensures the label is centered and vertical
            />
          </Box>
        );
      }

  
      return null;
    });
  };
  

  return (
    <Box p={2}>
      <Typography variant="h6" textAlign="center">
        {step || "None"}
      </Typography>
      <Box sx={{ padding: 2, marginTop: 2 }}>
        {renderForm()}
        <Box mt={2} textAlign="center">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingSteps;
