<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="../utilities/html/schematronHtml.xsl"?><sch:schema xmlns:sch="http://purl.oclc.org/dsdl/schematron" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" queryBinding="xslt2" id="EMSDataSet" schemaVersion="3.5.0.211008CP3" see="https://nemsis.org/technical-resources/version-3/version-3-schematron/">

  <sch:title>NEMSIS National ISO Schematron file for EMSDataSet</sch:title>

  <sch:ns prefix="nem" uri="http://www.nemsis.org"/>
  <sch:ns prefix="xsi" uri="http://www.w3.org/2001/XMLSchema-instance"/>

  <!-- "Initialize" variables used by nemsisDiagnostic. -->
  <sch:let name="nemsisElements" value="()"/>
  <sch:let name="nemsisElementsMissing" value="''"/>
  <sch:let name="nemsisElementsMissingContext" value="()"/>

  <!-- Set up key for NEMSIS element name lookup list (look up XML element name to retrieve NEMSIS element name). -->
  <xsl:variable name="nemSch_lookup_elements">
    <?DSDL_INCLUDE_START includes/lookup_elements.xml#nemSch_lookup_elements?><nemSch_lookup_elements xmlns="http://www.nemsis.org" xml:id="nemSch_lookup_elements">
  <element name="dAgency.01">EMS Agency Unique State ID</element>
  <element name="dAgency.02">EMS Agency Number</element>
  <element name="dAgency.03">EMS Agency Name</element>
  <element name="dAgency.04">EMS Agency State</element>
  <element name="dAgency.05">EMS Agency Service Area States</element>
  <element name="dAgency.06">EMS Agency Service Area County(ies)</element>
  <element name="dAgency.07">EMS Agency Census Tracts</element>
  <element name="dAgency.08">EMS Agency Service Area ZIP Codes</element>
  <element name="dAgency.09">Primary Type of Service</element>
  <element name="dAgency.10">Other Types of Service</element>
  <element name="dAgency.11">Level of Service</element>
  <element name="dAgency.12">Organization Status</element>
  <element name="dAgency.13">Organizational Type</element>
  <element name="dAgency.14">EMS Agency Organizational Tax Status</element>
  <element name="dAgency.15">Statistical Calendar Year</element>
  <element name="dAgency.16">Total Primary Service Area Size</element>
  <element name="dAgency.17">Total Service Area Population</element>
  <element name="dAgency.18">911 EMS Call Center Volume per Year</element>
  <element name="dAgency.19">EMS Dispatch Volume per Year</element>
  <element name="dAgency.20">EMS Patient Transport Volume per Year</element>
  <element name="dAgency.21">EMS Patient Contact Volume per Year</element>
  <element name="dAgency.22">EMS Billable Calls per Year</element>
  <element name="dAgency.23">EMS Agency Time Zone</element>
  <element name="dAgency.24">EMS Agency Daylight Savings Time Use</element>
  <element name="dAgency.25">National Provider Identifier</element>
  <element name="dAgency.26">Fire Department ID Number</element>
  <element name="dConfiguration.01">State Associated with this Configuration</element>
  <element name="dConfiguration.06">EMS Certification Levels Permitted to Perform Each Procedure</element>
  <element name="dConfiguration.07">EMS Agency Procedures</element>
  <element name="dConfiguration.08">EMS Certification Levels Permitted to Administer Each Medication</element>
  <element name="dConfiguration.09">EMS Agency Medications</element>
  <element name="dConfiguration.10">EMS Agency Protocols</element>
  <element name="dConfiguration.11">EMS Agency Specialty Service Capability</element>
  <element name="dConfiguration.12">Billing Status</element>
  <element name="dConfiguration.13">Emergency Medical Dispatch (EMD) Provided to EMS Agency Service Area</element>
  <element name="dConfiguration.14">EMD Vendor</element>
  <element name="dConfiguration.15">Patient Monitoring Capability(ies)</element>
  <element name="dConfiguration.16">Crew Call Sign</element>
  <element name="dConfiguration.17">Dispatch Center (CAD) Name or ID</element>
  <element name="dContact.01">Agency Contact Type</element>
  <element name="dContact.02">Agency Contact Last Name</element>
  <element name="dContact.03">Agency Contact First Name</element>
  <element name="dContact.04">Agency Contact Middle Name/Initial</element>
  <element name="dContact.05">Agency Contact Address</element>
  <element name="dContact.06">Agency Contact City</element>
  <element name="dContact.07">Agency Contact State</element>
  <element name="dContact.08">Agency Contact ZIP Code</element>
  <element name="dContact.09">Agency Contact Country</element>
  <element name="dContact.10">Agency Contact Phone Number</element>
  <element name="dContact.11">Agency Contact Email Address</element>
  <element name="dContact.12">EMS Agency Contact Web Address</element>
  <element name="dContact.13">Agency Medical Director Degree</element>
  <element name="dContact.14">Agency Medical Director Board Certification Type</element>
  <element name="dContact.15">Medical Director Compensation</element>
  <element name="dContact.16">EMS Medical Director Fellowship Trained Status</element>
  <element name="dCustomConfiguration.01">Custom Data Element Title</element>
  <element name="dCustomConfiguration.02">Custom Definition</element>
  <element name="dCustomConfiguration.03">Custom Data Type</element>
  <element name="dCustomConfiguration.04">Custom Data Element Recurrence</element>
  <element name="dCustomConfiguration.05">Custom Data Element Usage</element>
  <element name="dCustomConfiguration.06">Custom Data Element Potential Values</element>
  <element name="dCustomConfiguration.07">Custom Data Element Potential NOT Values (NV)</element>
  <element name="dCustomConfiguration.08">Custom Data Element Potential Pertinent Negative Values (PN)</element>
  <element name="dCustomConfiguration.09">Custom Data Element Grouping ID</element>
  <element name="dCustomResults.01">Custom Data Element Result</element>
  <element name="dCustomResults.02">Custom Element ID Referenced</element>
  <element name="dCustomResults.03">CorrelationID of DemographicReport Element or Group</element>
  <element name="dDevice.01">Medical Device Serial Number</element>
  <element name="dDevice.02">Medical Device Name or ID</element>
  <element name="dDevice.03">Medical Device Type</element>
  <element name="dDevice.04">Medical Device Manufacturer</element>
  <element name="dDevice.05">Medical Device Model Number</element>
  <element name="dDevice.06">Medical Device Purchase Date</element>
  <element name="dFacility.01">Type of Facility</element>
  <element name="dFacility.02">Facility Name</element>
  <element name="dFacility.03">Facility Location Code</element>
  <element name="dFacility.04">Hospital Designations</element>
  <element name="dFacility.05">Facility National Provider Identifier</element>
  <element name="dFacility.06">Facility Room, Suite, or Apartment</element>
  <element name="dFacility.07">Facility Street Address</element>
  <element name="dFacility.08">Facility City</element>
  <element name="dFacility.09">Facility State</element>
  <element name="dFacility.10">Facility ZIP Code</element>
  <element name="dFacility.11">Facility County</element>
  <element name="dFacility.12">Facility Country</element>
  <element name="dFacility.13">Facility GPS Location</element>
  <element name="dFacility.14">Facility US National Grid Coordinates</element>
  <element name="dFacility.15">Facility Phone Number</element>
  <element name="dLocation.01">EMS Location Type</element>
  <element name="dLocation.02">EMS Location Name</element>
  <element name="dLocation.03">EMS Location Number</element>
  <element name="dLocation.04">EMS Location GPS</element>
  <element name="dLocation.05">EMS Location US National Grid Coordinates</element>
  <element name="dLocation.06">EMS Location Address</element>
  <element name="dLocation.07">EMS Location City</element>
  <element name="dLocation.08">EMS Location State</element>
  <element name="dLocation.09">EMS Station or Location ZIP Code</element>
  <element name="dLocation.10">EMS Location County</element>
  <element name="dLocation.11">EMS Location Country</element>
  <element name="dLocation.12">EMS Location Phone Number</element>
  <element name="dPersonnel.01">EMS Personnel's Last Name</element>
  <element name="dPersonnel.02">EMS Personnel's First Name</element>
  <element name="dPersonnel.03">EMS Personnel's Middle Name/Initial</element>
  <element name="dPersonnel.04">EMS Personnel's Mailing Address</element>
  <element name="dPersonnel.05">EMS Personnel's City of Residence</element>
  <element name="dPersonnel.06">EMS Personnel's State</element>
  <element name="dPersonnel.07">EMS Personnel's ZIP Code</element>
  <element name="dPersonnel.08">EMS Personnel's Country</element>
  <element name="dPersonnel.09">EMS Personnel's Phone Number</element>
  <element name="dPersonnel.10">EMS Personnel's Email Address</element>
  <element name="dPersonnel.11">EMS Personnel's Date of Birth</element>
  <element name="dPersonnel.12">EMS Personnel's Gender</element>
  <element name="dPersonnel.13">EMS Personnel's Race</element>
  <element name="dPersonnel.14">EMS Personnel's Citizenship</element>
  <element name="dPersonnel.15">EMS Personnel's Highest Educational Degree</element>
  <element name="dPersonnel.16">EMS Personnel's Degree Subject/Field of Study</element>
  <element name="dPersonnel.17">EMS Personnel's Motor Vehicle License Type</element>
  <element name="dPersonnel.18">EMS Personnel's Immunization Status</element>
  <element name="dPersonnel.19">EMS Personnel's Immunization Year</element>
  <element name="dPersonnel.20">EMS Personnel's Foreign Language Ability</element>
  <element name="dPersonnel.21">EMS Personnel's Agency ID Number</element>
  <element name="dPersonnel.22">EMS Personnel's State of Licensure</element>
  <element name="dPersonnel.23">EMS Personnel's State's Licensure ID Number</element>
  <element name="dPersonnel.24">EMS Personnel's State EMS Certification Licensure Level</element>
  <element name="dPersonnel.25">EMS Personnel's State EMS Current Certification Date</element>
  <element name="dPersonnel.26">EMS Personnel's Initial State's Licensure Issue Date</element>
  <element name="dPersonnel.27">EMS Personnel's Current State's Licensure Expiration Date</element>
  <element name="dPersonnel.28">EMS Personnel's National Registry Number</element>
  <element name="dPersonnel.29">EMS Personnel's National Registry Certification Level</element>
  <element name="dPersonnel.30">EMS Personnel's Current National Registry Expiration Date</element>
  <element name="dPersonnel.31">EMS Personnel's Employment Status</element>
  <element name="dPersonnel.32">EMS Personnel's Employment Status Date</element>
  <element name="dPersonnel.33">EMS Personnel's Hire Date</element>
  <element name="dPersonnel.34">EMS Personnel's Primary EMS Job Role</element>
  <element name="dPersonnel.35">EMS Personnel's Other Job Responsibilities</element>
  <element name="dPersonnel.36">EMS Personnel's Total Length of Service in Years</element>
  <element name="dPersonnel.37">EMS Personnel's Date Length of Service Documented</element>
  <element name="dPersonnel.38">EMS Personnel's Practice Level</element>
  <element name="dPersonnel.39">Date of Personnel's Certification or Licensure for Agency</element>
  <element name="dVehicle.01">Unit/Vehicle Number</element>
  <element name="dVehicle.02">Vehicle Identification Number</element>
  <element name="dVehicle.03">EMS Unit Call Sign</element>
  <element name="dVehicle.04">Vehicle Type</element>
  <element name="dVehicle.05">Crew State Certification/Licensure Levels</element>
  <element name="dVehicle.06">Number of Each EMS Personnel Level on Normal 911 Ambulance Response</element>
  <element name="dVehicle.07">Number of Each EMS Personnel Level on Normal 911 Response (Non-Transport) Vehicle</element>
  <element name="dVehicle.08">Number of Each EMS Personnel Level on Normal Medical (Non-911) Transport Ambulance</element>
  <element name="dVehicle.09">Vehicle Initial Cost</element>
  <element name="dVehicle.10">Vehicle Model Year</element>
  <element name="dVehicle.11">Year Miles/Kilometers Hours Accrued</element>
  <element name="dVehicle.12">Annual Vehicle Hours</element>
  <element name="dVehicle.13">Annual Vehicle Miles/Kilometers</element>
  <element name="eAirway.01">Indications for Invasive Airway</element>
  <element name="eAirway.02">Date/Time Airway Device Placement Confirmation</element>
  <element name="eAirway.03">Airway Device Being Confirmed</element>
  <element name="eAirway.04">Airway Device Placement Confirmed Method</element>
  <element name="eAirway.05">Tube Depth</element>
  <element name="eAirway.06">Type of Individual Confirming Airway Device Placement</element>
  <element name="eAirway.07">Crew Member ID</element>
  <element name="eAirway.08">Airway Complications Encountered</element>
  <element name="eAirway.09">Suspected Reasons for Failed Airway Management</element>
  <element name="eAirway.10">Date/Time Decision to Manage the Patient with an Invasive Airway</element>
  <element name="eAirway.11">Date/Time Invasive Airway Placement Attempts Abandoned</element>
  <element name="eArrest.01">Cardiac Arrest</element>
  <element name="eArrest.02">Cardiac Arrest Etiology</element>
  <element name="eArrest.03">Resuscitation Attempted By EMS</element>
  <element name="eArrest.04">Arrest Witnessed By</element>
  <element name="eArrest.07">AED Use Prior to EMS Arrival</element>
  <element name="eArrest.09">Type of CPR Provided</element>
  <element name="eArrest.10">Therapeutic Hypothermia by EMS</element>
  <element name="eArrest.11">First Monitored Arrest Rhythm of the Patient</element>
  <element name="eArrest.12">Any Return of Spontaneous Circulation</element>
  <element name="eArrest.13">Neurological Outcome at Hospital Discharge</element>
  <element name="eArrest.14">Date/Time of Cardiac Arrest</element>
  <element name="eArrest.15">Date/Time Resuscitation Discontinued</element>
  <element name="eArrest.16">Reason CPR/Resuscitation Discontinued</element>
  <element name="eArrest.17">Cardiac Rhythm on Arrival at Destination</element>
  <element name="eArrest.18">End of EMS Cardiac Arrest Event</element>
  <element name="eArrest.19">Date/Time of Initial CPR</element>
  <element name="eArrest.20">Who First Initiated CPR</element>
  <element name="eArrest.21">Who First Applied the AED</element>
  <element name="eArrest.22">Who First Defibrillated the Patient</element>
  <element name="eCrew.01">Crew Member ID</element>
  <element name="eCrew.02">Crew Member Level</element>
  <element name="eCrew.03">Crew Member Response Role</element>
  <element name="eCustomConfiguration.01">Custom Data Element Title</element>
  <element name="eCustomConfiguration.02">Custom Definition</element>
  <element name="eCustomConfiguration.03">Custom Data Type</element>
  <element name="eCustomConfiguration.04">Custom Data Element Recurrence</element>
  <element name="eCustomConfiguration.05">Custom Data Element Usage</element>
  <element name="eCustomConfiguration.06">Custom Data Element Potential Values</element>
  <element name="eCustomConfiguration.07">Custom Data Element Potential NOT Values (NV)</element>
  <element name="eCustomConfiguration.08">Custom Data Element Potential Pertinent Negative Values (PN)</element>
  <element name="eCustomConfiguration.09">Custom Data Element Grouping ID</element>
  <element name="eCustomResults.01">Custom Data Element Result</element>
  <element name="eCustomResults.02">Custom Element ID Referenced</element>
  <element name="eCustomResults.03">CorrelationID of PatientCareReport Element or Group</element>
  <element name="eDevice.01">Medical Device Serial Number</element>
  <element name="eDevice.02">Date/Time of Event (per Medical Device)</element>
  <element name="eDevice.03">Medical Device Event Type</element>
  <element name="eDevice.04">Medical Device Waveform Graphic Type</element>
  <element name="eDevice.05">Medical Device Waveform Graphic</element>
  <element name="eDevice.06">Medical Device Mode (Manual, AED, Pacing, CO2, O2, etc)</element>
  <element name="eDevice.07">Medical Device ECG Lead</element>
  <element name="eDevice.08">Medical Device ECG Interpretation</element>
  <element name="eDevice.09">Type of Shock</element>
  <element name="eDevice.10">Shock or Pacing Energy</element>
  <element name="eDevice.11">Total Number of Shocks Delivered</element>
  <element name="eDevice.12">Pacing Rate</element>
  <element name="eDispatch.01">Dispatch Reason</element>
  <element name="eDispatch.02">EMD Performed</element>
  <element name="eDispatch.03">EMD Card Number</element>
  <element name="eDispatch.04">Dispatch Center Name or ID</element>
  <element name="eDispatch.05">Dispatch Priority (Patient Acuity)</element>
  <element name="eDispatch.06">Unit Dispatched CAD Record ID</element>
  <element name="eDisposition.01">Destination/Transferred To, Name</element>
  <element name="eDisposition.02">Destination/Transferred To, Code</element>
  <element name="eDisposition.03">Destination Street Address</element>
  <element name="eDisposition.04">Destination City</element>
  <element name="eDisposition.05">Destination State</element>
  <element name="eDisposition.06">Destination County</element>
  <element name="eDisposition.07">Destination ZIP Code</element>
  <element name="eDisposition.08">Destination Country</element>
  <element name="eDisposition.09">Destination GPS Location</element>
  <element name="eDisposition.10">Destination Location US National Grid Coordinates </element>
  <element name="eDisposition.11">Number of Patients Transported in this EMS Unit</element>
  <element name="eDisposition.13">How Patient Was Moved to Ambulance</element>
  <element name="eDisposition.14">Position of Patient During Transport</element>
  <element name="eDisposition.15">How Patient Was Moved From Ambulance</element>
  <element name="eDisposition.16">EMS Transport Method</element>
  <element name="eDisposition.17">Transport Mode from Scene</element>
  <element name="eDisposition.18">Additional Transport Mode Descriptors</element>
  <element name="eDisposition.19">Final Patient Acuity</element>
  <element name="eDisposition.20">Reason for Choosing Destination</element>
  <element name="eDisposition.21">Type of Destination</element>
  <element name="eDisposition.22">Hospital In-Patient Destination</element>
  <element name="eDisposition.23">Hospital Capability</element>
  <element name="eDisposition.24">Destination Team Pre-Arrival Alert or Activation</element>
  <element name="eDisposition.25">Date/Time of Destination Prearrival Alert or Activation</element>
  <element name="eDisposition.26">Disposition Instructions Provided</element>
  <element name="eDisposition.27">Unit Disposition</element>
  <element name="eDisposition.28">Patient Evaluation/Care</element>
  <element name="eDisposition.29">Crew Disposition</element>
  <element name="eDisposition.30">Transport Disposition</element>
  <element name="eDisposition.31">Reason for Refusal/Release</element>
  <element name="eDisposition.32">Level of Care Provided per Protocol</element>
  <element name="eExam.01">Estimated Body Weight in Kilograms</element>
  <element name="eExam.02">Length Based Tape Measure</element>
  <element name="eExam.03">Date/Time of Assessment</element>
  <element name="eExam.04">Skin Assessment</element>
  <element name="eExam.05">Head Assessment</element>
  <element name="eExam.06">Face Assessment</element>
  <element name="eExam.07">Neck Assessment</element>
  <element name="eExam.09">Heart Assessment</element>
  <element name="eExam.10">Abdominal Assessment Finding Location</element>
  <element name="eExam.11">Abdomen Assessment</element>
  <element name="eExam.12">Pelvis/Genitourinary Assessment</element>
  <element name="eExam.13">Back and Spine Assessment Finding Location</element>
  <element name="eExam.14">Back and Spine Assessment</element>
  <element name="eExam.15">Extremity Assessment Finding Location</element>
  <element name="eExam.16">Extremities Assessment</element>
  <element name="eExam.17">Eye Assessment Finding Location</element>
  <element name="eExam.18">Eye Assessment</element>
  <element name="eExam.19">Mental Status Assessment</element>
  <element name="eExam.20">Neurological Assessment</element>
  <element name="eExam.21">Stroke/CVA Symptoms Resolved</element>
  <element name="eExam.22">Lung Assessment Finding Location</element>
  <element name="eExam.23">Lung Assessment</element>
  <element name="eExam.24">Chest Assessment Finding Location</element>
  <element name="eExam.25">Chest Assessment</element>
  <element name="eHistory.01">Barriers to Patient Care</element>
  <element name="eHistory.02">Last Name of Patient's Practitioner</element>
  <element name="eHistory.03">First Name of Patient's Practitioner</element>
  <element name="eHistory.04">Middle Name/Initial of Patient's Practitioner</element>
  <element name="eHistory.05">Advance Directives</element>
  <element name="eHistory.06">Medication Allergies</element>
  <element name="eHistory.07">Environmental/Food Allergies</element>
  <element name="eHistory.08">Medical/Surgical History</element>
  <element name="eHistory.09">Medical History Obtained From</element>
  <element name="eHistory.10">The Patient's Type of Immunization</element>
  <element name="eHistory.11">Immunization Year</element>
  <element name="eHistory.12">Current Medications</element>
  <element name="eHistory.13">Current Medication Dose</element>
  <element name="eHistory.14">Current Medication Dosage Unit</element>
  <element name="eHistory.15">Current Medication Administration Route</element>
  <element name="eHistory.16">Presence of Emergency Information Form</element>
  <element name="eHistory.17">Alcohol/Drug Use Indicators</element>
  <element name="eHistory.18">Pregnancy</element>
  <element name="eHistory.19">Last Oral Intake</element>
  <element name="eHistory.20">Current Medication Frequency</element>
  <element name="eInjury.01">Cause of Injury</element>
  <element name="eInjury.02">Mechanism of Injury</element>
  <element name="eInjury.03">Trauma Triage Criteria (Steps 1 and 2)</element>
  <element name="eInjury.04">Trauma Triage Criteria (Steps 3 and 4)</element>
  <element name="eInjury.05">Main Area of the Vehicle Impacted by the Collision</element>
  <element name="eInjury.06">Location of Patient in Vehicle</element>
  <element name="eInjury.07">Use of Occupant Safety Equipment</element>
  <element name="eInjury.08">Airbag Deployment</element>
  <element name="eInjury.09">Height of Fall (feet)</element>
  <element name="eInjury.10">OSHA Personal Protective Equipment Used</element>
  <element name="eInjury.11">ACN System/Company Providing ACN Data</element>
  <element name="eInjury.12">ACN Incident ID</element>
  <element name="eInjury.13">ACN Call Back Phone Number</element>
  <element name="eInjury.14">Date/Time of ACN Incident</element>
  <element name="eInjury.15">ACN Incident Location</element>
  <element name="eInjury.16">ACN Incident Vehicle Body Type</element>
  <element name="eInjury.17">ACN Incident Vehicle Manufacturer</element>
  <element name="eInjury.18">ACN Incident Vehicle Make</element>
  <element name="eInjury.19">ACN Incident Vehicle Model</element>
  <element name="eInjury.20">ACN Incident Vehicle Model Year</element>
  <element name="eInjury.21">ACN Incident Multiple Impacts</element>
  <element name="eInjury.22">ACN Incident Delta Velocity</element>
  <element name="eInjury.23">ACN High Probability of Injury</element>
  <element name="eInjury.24">ACN Incident PDOF</element>
  <element name="eInjury.25">ACN Incident Rollover</element>
  <element name="eInjury.26">ACN Vehicle Seat Location</element>
  <element name="eInjury.27">Seat Occupied</element>
  <element name="eInjury.28">ACN Incident Seatbelt Use</element>
  <element name="eInjury.29">ACN Incident Airbag Deployed</element>
  <element name="eLabs.01">Date/Time of Laboratory or Imaging Result</element>
  <element name="eLabs.02">Study/Result Prior to this Unit's EMS Care</element>
  <element name="eLabs.03">Laboratory Result Type</element>
  <element name="eLabs.04">Laboratory Result</element>
  <element name="eLabs.05">Imaging Study Type</element>
  <element name="eLabs.06">Imaging Study Results</element>
  <element name="eLabs.07">Imaging Study File or Waveform Graphic Type</element>
  <element name="eLabs.08">Imaging Study File or Waveform Graphic</element>
  <element name="eMedications.01">Date/Time Medication Administered</element>
  <element name="eMedications.02">Medication Administered Prior to this Unit's EMS Care</element>
  <element name="eMedications.03">Medication Administered</element>
  <element name="eMedications.04">Medication Administered Route</element>
  <element name="eMedications.05">Medication Dosage</element>
  <element name="eMedications.06">Medication Dosage Units</element>
  <element name="eMedications.07">Response to Medication</element>
  <element name="eMedications.08">Medication Complication</element>
  <element name="eMedications.09">Medication Crew (Healthcare Professionals) ID</element>
  <element name="eMedications.10">Role/Type of Person Administering Medication</element>
  <element name="eMedications.11">Medication Authorization</element>
  <element name="eMedications.12">Medication Authorizing Physician</element>
  <element name="eNarrative.01">Patient Care Report Narrative</element>
  <element name="eOther.01">Review Requested</element>
  <element name="eOther.02">Potential System of Care/Specialty/Registry Patient</element>
  <element name="eOther.03">Personal Protective Equipment Used</element>
  <element name="eOther.04">EMS Professional (Crew Member) ID</element>
  <element name="eOther.05">Suspected EMS Work Related Exposure, Injury, or Death</element>
  <element name="eOther.06">The Type of Work-Related Injury, Death or Suspected Exposure</element>
  <element name="eOther.07">Natural, Suspected, Intentional, or Unintentional Disaster</element>
  <element name="eOther.08">Crew Member Completing this Report</element>
  <element name="eOther.09">External Electronic Document Type</element>
  <element name="eOther.10">File Attachment Type</element>
  <element name="eOther.11">File Attachment Image</element>
  <element name="eOther.12">Type of Person Signing</element>
  <element name="eOther.13">Signature Reason</element>
  <element name="eOther.14">Type Of Patient Representative</element>
  <element name="eOther.15">Signature Status</element>
  <element name="eOther.16">Signature File Name</element>
  <element name="eOther.17">Signature File Type</element>
  <element name="eOther.18">Signature Graphic</element>
  <element name="eOther.19">Date/Time of Signature</element>
  <element name="eOther.20">Signature Last Name</element>
  <element name="eOther.21">Signature First Name</element>
  <element name="eOther.22">File Attachment Name</element>
  <element name="eOutcome.01">Emergency Department Disposition</element>
  <element name="eOutcome.02">Hospital Disposition</element>
  <element name="eOutcome.03">External Report ID/Number Type</element>
  <element name="eOutcome.04">External Report ID/Number</element>
  <element name="eOutcome.05">Other Report Registry Type</element>
  <element name="eOutcome.09">Emergency Department Procedures</element>
  <element name="eOutcome.10">Emergency Department Diagnosis</element>
  <element name="eOutcome.11">Date/Time of Hospital Admission</element>
  <element name="eOutcome.12">Hospital Procedures</element>
  <element name="eOutcome.13">Hospital Diagnosis</element>
  <element name="eOutcome.16">Date/Time of Hospital Discharge</element>
  <element name="eOutcome.17">Outcome at Hospital Discharge</element>
  <element name="eOutcome.18">Date/Time of Emergency Department Admission</element>
  <element name="eOutcome.19">Date/Time Emergency Department Procedure Performed</element>
  <element name="eOutcome.20">Date/Time Hospital Procedure Performed</element>
  <element name="ePatient.01">EMS Patient ID</element>
  <element name="ePatient.02">Last Name</element>
  <element name="ePatient.03">First Name</element>
  <element name="ePatient.04">Middle Initial/Name</element>
  <element name="ePatient.05">Patient's Home Address</element>
  <element name="ePatient.06">Patient's Home City</element>
  <element name="ePatient.07">Patient's Home County</element>
  <element name="ePatient.08">Patient's Home State</element>
  <element name="ePatient.09">Patient's Home ZIP Code</element>
  <element name="ePatient.10">Patient's Country of Residence</element>
  <element name="ePatient.11">Patient Home Census Tract</element>
  <element name="ePatient.12">Social Security Number</element>
  <element name="ePatient.13">Gender</element>
  <element name="ePatient.14">Race</element>
  <element name="ePatient.15">Age</element>
  <element name="ePatient.16">Age Units</element>
  <element name="ePatient.17">Date of Birth</element>
  <element name="ePatient.18">Patient's Phone Number</element>
  <element name="ePatient.19">Patient's Email Address</element>
  <element name="ePatient.20">State Issuing Driver's License</element>
  <element name="ePatient.21">Driver's License Number</element>
  <element name="ePatient.22">Alternate Home Residence</element>
  <element name="ePayment.01">Primary Method of Payment</element>
  <element name="ePayment.02">Physician Certification Statement</element>
  <element name="ePayment.03">Date Physician Certification Statement Signed</element>
  <element name="ePayment.04">Reason for Physician Certification Statement</element>
  <element name="ePayment.05">Healthcare Provider Type Signing Physician Certification Statement</element>
  <element name="ePayment.06">Last Name of Individual Signing Physician Certification Statement</element>
  <element name="ePayment.07">First Name of Individual Signing Physician Certification Statement</element>
  <element name="ePayment.08">Patient Resides in Service Area</element>
  <element name="ePayment.09">Insurance Company ID</element>
  <element name="ePayment.10">Insurance Company Name</element>
  <element name="ePayment.11">Insurance Company Billing Priority</element>
  <element name="ePayment.12">Insurance Company Address</element>
  <element name="ePayment.13">Insurance Company City</element>
  <element name="ePayment.14">Insurance Company State</element>
  <element name="ePayment.15">Insurance Company ZIP Code</element>
  <element name="ePayment.16">Insurance Company Country</element>
  <element name="ePayment.17">Insurance Group ID</element>
  <element name="ePayment.18">Insurance Policy ID Number</element>
  <element name="ePayment.19">Last Name of the Insured</element>
  <element name="ePayment.20">First Name of the Insured</element>
  <element name="ePayment.21">Middle Initial/Name of the Insured</element>
  <element name="ePayment.22">Relationship to the Insured</element>
  <element name="ePayment.23">Closest Relative/Guardian Last Name</element>
  <element name="ePayment.24">Closest Relative/ Guardian First Name</element>
  <element name="ePayment.25">Closest Relative/ Guardian Middle Initial/Name</element>
  <element name="ePayment.26">Closest Relative/ Guardian Street Address</element>
  <element name="ePayment.27">Closest Relative/ Guardian City</element>
  <element name="ePayment.28">Closest Relative/ Guardian State</element>
  <element name="ePayment.29">Closest Relative/ Guardian ZIP Code</element>
  <element name="ePayment.30">Closest Relative/ Guardian Country</element>
  <element name="ePayment.31">Closest Relative/ Guardian Phone Number</element>
  <element name="ePayment.32">Closest Relative/ Guardian Relationship</element>
  <element name="ePayment.33">Patient's Employer</element>
  <element name="ePayment.34">Patient's Employer's Address</element>
  <element name="ePayment.35">Patient's Employer's City</element>
  <element name="ePayment.36">Patient's Employer's State</element>
  <element name="ePayment.37">Patient's Employer's ZIP Code</element>
  <element name="ePayment.38">Patient's Employer's Country</element>
  <element name="ePayment.39">Patient's Employer's Primary Phone Number</element>
  <element name="ePayment.40">Response Urgency</element>
  <element name="ePayment.41">Patient Transport Assessment</element>
  <element name="ePayment.42">Specialty Care Transport Care Provider</element>
  <element name="ePayment.44">Ambulance Transport Reason Code</element>
  <element name="ePayment.45">Round Trip Purpose Description</element>
  <element name="ePayment.46">Stretcher Purpose Description</element>
  <element name="ePayment.47">Ambulance Conditions Indicator</element>
  <element name="ePayment.48">Mileage to Closest Hospital Facility</element>
  <element name="ePayment.49">ALS Assessment Performed and Warranted</element>
  <element name="ePayment.50">CMS Service Level</element>
  <element name="ePayment.51">EMS Condition Code</element>
  <element name="ePayment.52">CMS Transportation Indicator</element>
  <element name="ePayment.53">Transport Authorization Code</element>
  <element name="ePayment.54">Prior Authorization Code Payer</element>
  <element name="ePayment.55">Supply Item Used Name</element>
  <element name="ePayment.56">Number of Supply Item(s) Used</element>
  <element name="ePayment.57">Payer Type</element>
  <element name="ePayment.58">Insurance Group Name</element>
  <element name="ePayment.59">Insurance Company Phone Number</element>
  <element name="ePayment.60">Date of Birth of the Insured</element>
  <element name="eProcedures.01">Date/Time Procedure Performed</element>
  <element name="eProcedures.02">Procedure Performed Prior to this Unit's EMS Care</element>
  <element name="eProcedures.03">Procedure</element>
  <element name="eProcedures.04">Size of Procedure Equipment</element>
  <element name="eProcedures.05">Number of Procedure Attempts</element>
  <element name="eProcedures.06">Procedure Successful</element>
  <element name="eProcedures.07">Procedure Complication</element>
  <element name="eProcedures.08">Response to Procedure</element>
  <element name="eProcedures.09">Procedure Crew Members ID</element>
  <element name="eProcedures.10">Role/Type of Person Performing the Procedure</element>
  <element name="eProcedures.11">Procedure Authorization</element>
  <element name="eProcedures.12">Procedure Authorizing Physician</element>
  <element name="eProcedures.13">Vascular Access Location</element>
  <element name="eProtocols.01">Protocols Used</element>
  <element name="eProtocols.02">Protocol Age Category</element>
  <element name="eRecord.01">Patient Care Report Number</element>
  <element name="eRecord.02">Software Creator</element>
  <element name="eRecord.03">Software Name</element>
  <element name="eRecord.04">Software Version</element>
  <element name="eResponse.01">EMS Agency Number</element>
  <element name="eResponse.02">EMS Agency Name</element>
  <element name="eResponse.03">Incident Number</element>
  <element name="eResponse.04">EMS Response Number</element>
  <element name="eResponse.05">Type of Service Requested</element>
  <element name="eResponse.06">Standby Purpose</element>
  <element name="eResponse.07">Unit Transport and Equipment Capability</element>
  <element name="eResponse.08">Type of Dispatch Delay</element>
  <element name="eResponse.09">Type of Response Delay</element>
  <element name="eResponse.10">Type of Scene Delay</element>
  <element name="eResponse.11">Type of Transport Delay</element>
  <element name="eResponse.12">Type of Turn-Around Delay</element>
  <element name="eResponse.13">EMS Vehicle (Unit) Number</element>
  <element name="eResponse.14">EMS Unit Call Sign</element>
  <element name="eResponse.16">Vehicle Dispatch Location</element>
  <element name="eResponse.17">Vehicle Dispatch GPS Location</element>
  <element name="eResponse.18">Vehicle Dispatch Location US National Grid Coordinates</element>
  <element name="eResponse.19">Beginning Odometer Reading of Responding Vehicle</element>
  <element name="eResponse.20">On-Scene Odometer Reading of Responding Vehicle</element>
  <element name="eResponse.21">Patient Destination Odometer Reading of Responding Vehicle</element>
  <element name="eResponse.22">Ending Odometer Reading of Responding Vehicle</element>
  <element name="eResponse.23">Response Mode to Scene</element>
  <element name="eResponse.24">Additional Response Mode Descriptors</element>
  <element name="eScene.01">First EMS Unit on Scene</element>
  <element name="eScene.02">Other EMS or Public Safety Agencies at Scene</element>
  <element name="eScene.03">Other EMS or Public Safety Agency ID Number</element>
  <element name="eScene.04">Type of Other Service at Scene</element>
  <element name="eScene.05">Date/Time Initial Responder Arrived on Scene</element>
  <element name="eScene.06">Number of Patients at Scene</element>
  <element name="eScene.07">Mass Casualty Incident</element>
  <element name="eScene.08">Triage Classification for MCI Patient</element>
  <element name="eScene.09">Incident Location Type</element>
  <element name="eScene.10">Incident Facility Code</element>
  <element name="eScene.11">Scene GPS Location</element>
  <element name="eScene.12">Scene US National Grid Coordinates</element>
  <element name="eScene.13">Incident Facility or Location Name</element>
  <element name="eScene.14">Mile Post or Major Roadway</element>
  <element name="eScene.15">Incident Street Address</element>
  <element name="eScene.16">Incident Apartment, Suite, or Room</element>
  <element name="eScene.17">Incident City</element>
  <element name="eScene.18">Incident State</element>
  <element name="eScene.19">Incident ZIP Code</element>
  <element name="eScene.20">Scene Cross Street or Directions</element>
  <element name="eScene.21">Incident County</element>
  <element name="eScene.22">Incident Country</element>
  <element name="eScene.23">Incident Census Tract</element>
  <element name="eScene.24">First Other EMS or Public Safety Agency at Scene to Provide Patient Care</element>
  <element name="eSituation.01">Date/Time of Symptom Onset</element>
  <element name="eSituation.02">Possible Injury</element>
  <element name="eSituation.03">Complaint Type</element>
  <element name="eSituation.04">Complaint</element>
  <element name="eSituation.05">Duration of Complaint</element>
  <element name="eSituation.06">Time Units of Duration of Complaint</element>
  <element name="eSituation.07">Chief Complaint Anatomic Location</element>
  <element name="eSituation.08">Chief Complaint Organ System</element>
  <element name="eSituation.09">Primary Symptom</element>
  <element name="eSituation.10">Other Associated Symptoms</element>
  <element name="eSituation.11">Provider's Primary Impression</element>
  <element name="eSituation.12">Provider's Secondary Impressions</element>
  <element name="eSituation.13">Initial Patient Acuity</element>
  <element name="eSituation.14">Work-Related Illness/Injury</element>
  <element name="eSituation.15">Patient's Occupational Industry</element>
  <element name="eSituation.16">Patient's Occupation</element>
  <element name="eSituation.17">Patient Activity</element>
  <element name="eSituation.18">Date/Time Last Known Well</element>
  <element name="eSituation.19">Justification for Transfer or Encounter</element>
  <element name="eSituation.20">Reason for Interfacility Transfer/Medical Transport</element>
  <element name="eTimes.01">PSAP Call Date/Time</element>
  <element name="eTimes.02">Dispatch Notified Date/Time</element>
  <element name="eTimes.03">Unit Notified by Dispatch Date/Time</element>
  <element name="eTimes.04">Dispatch Acknowledged Date/Time</element>
  <element name="eTimes.05">Unit En Route Date/Time</element>
  <element name="eTimes.06">Unit Arrived on Scene Date/Time</element>
  <element name="eTimes.07">Arrived at Patient Date/Time</element>
  <element name="eTimes.08">Transfer of EMS Patient Care Date/Time</element>
  <element name="eTimes.09">Unit Left Scene Date/Time</element>
  <element name="eTimes.10">Arrival at Destination Landing Area Date/Time</element>
  <element name="eTimes.11">Patient Arrived at Destination Date/Time</element>
  <element name="eTimes.12">Destination Patient Transfer of Care Date/Time</element>
  <element name="eTimes.13">Unit Back in Service Date/Time</element>
  <element name="eTimes.14">Unit Canceled Date/Time</element>
  <element name="eTimes.15">Unit Back at Home Location Date/Time</element>
  <element name="eTimes.16">EMS Call Completed Date/Time</element>
  <element name="eTimes.17">Unit Arrived at Staging Area Date/Time</element>
  <element name="eVitals.01">Date/Time Vital Signs Taken</element>
  <element name="eVitals.02">Obtained Prior to this Unit's EMS Care</element>
  <element name="eVitals.03">Cardiac Rhythm / Electrocardiography (ECG)</element>
  <element name="eVitals.04">ECG Type</element>
  <element name="eVitals.05">Method of ECG Interpretation</element>
  <element name="eVitals.06">SBP (Systolic Blood Pressure)</element>
  <element name="eVitals.07">DBP (Diastolic Blood Pressure)</element>
  <element name="eVitals.08">Method of Blood Pressure Measurement</element>
  <element name="eVitals.09">Mean Arterial Pressure</element>
  <element name="eVitals.10">Heart Rate</element>
  <element name="eVitals.11">Method of Heart Rate Measurement</element>
  <element name="eVitals.12">Pulse Oximetry</element>
  <element name="eVitals.13">Pulse Rhythm</element>
  <element name="eVitals.14">Respiratory Rate</element>
  <element name="eVitals.15">Respiratory Effort</element>
  <element name="eVitals.16">End Tidal Carbon Dioxide (ETCO2)</element>
  <element name="eVitals.17">Carbon Monoxide (CO)</element>
  <element name="eVitals.18">Blood Glucose Level</element>
  <element name="eVitals.19">Glasgow Coma Score-Eye</element>
  <element name="eVitals.20">Glasgow Coma Score-Verbal</element>
  <element name="eVitals.21">Glasgow Coma Score-Motor</element>
  <element name="eVitals.22">Glasgow Coma Score-Qualifier</element>
  <element name="eVitals.23">Total Glasgow Coma Score</element>
  <element name="eVitals.24">Temperature</element>
  <element name="eVitals.25">Temperature Method</element>
  <element name="eVitals.26">Level of Responsiveness (AVPU)</element>
  <element name="eVitals.27">Pain Scale Score</element>
  <element name="eVitals.28">Pain Scale Type</element>
  <element name="eVitals.29">Stroke Scale Score</element>
  <element name="eVitals.30">Stroke Scale Type</element>
  <element name="eVitals.31">Reperfusion Checklist</element>
  <element name="eVitals.32">APGAR</element>
  <element name="eVitals.33">Revised Trauma Score</element>
  <element name="sAgency.01">EMS Agency Unique State ID</element>
  <element name="sAgency.02">EMS Agency Number</element>
  <element name="sAgency.03">EMS Agency Name</element>
  <element name="sConfiguration.01">State Certification/Licensure Levels</element>
  <element name="sConfiguration.02">EMS Certification Levels Permitted to Perform Each Procedure</element>
  <element name="sConfiguration.03">Procedures Permitted by the State</element>
  <element name="sConfiguration.04">EMS Certification Levels Permitted to Administer Each Medication</element>
  <element name="sConfiguration.05">Medications Permitted by the State</element>
  <element name="sConfiguration.06">Protocols Permitted by the State</element>
  <element name="sElement.01">State Collected Element</element>
  <element name="sFacility.01">Type of Facility</element>
  <element name="sFacility.02">Facility Name</element>
  <element name="sFacility.03">Facility Location Code</element>
  <element name="sFacility.04">Hospital Designations</element>
  <element name="sFacility.05">Facility National Provider Identifier</element>
  <element name="sFacility.06">Facility Room, Suite, or Apartment</element>
  <element name="sFacility.07">Facility Street Address</element>
  <element name="sFacility.08">Facility City</element>
  <element name="sFacility.09">Facility State</element>
  <element name="sFacility.10">Facility ZIP Code</element>
  <element name="sFacility.11">Facility County</element>
  <element name="sFacility.12">Facility Country</element>
  <element name="sFacility.13">Facility GPS Location</element>
  <element name="sFacility.14">Facility US National Grid Coordinates</element>
  <element name="sFacility.15">Facility Phone Number</element>
  <element name="sSoftware.01">Software Creator</element>
  <element name="sSoftware.02">Software Name</element>
  <element name="sSoftware.03">Software Version</element>
  <element name="sState.01">State</element>
  <element name="sdCustomConfiguration.01">Agency Demographic Custom Data Element Title</element>
  <element name="sdCustomConfiguration.02">Agency Demographic Custom Definition</element>
  <element name="sdCustomConfiguration.03">Agency Demographic Custom Data Type</element>
  <element name="sdCustomConfiguration.04">Agency Demographic Custom Data Element Recurrence</element>
  <element name="sdCustomConfiguration.05">Agency Demographic Custom Data Element Usage</element>
  <element name="sdCustomConfiguration.06">Agency Demographic Custom Data Element Potential Values</element>
  <element name="sdCustomConfiguration.07">Agency Demographic Custom Data Element Potential NOT Values (NV)</element>
  <element name="sdCustomConfiguration.08">Agency Demographic Custom Data Element Potential Pertinent Negative Values (PN)</element>
  <element name="sdCustomConfiguration.09">Agency Demographic Custom Data Element Grouping ID</element>
  <element name="seCustomConfiguration.01">Patient Care Report Custom Data Element Title</element>
  <element name="seCustomConfiguration.02">Patient Care Report Custom Definition</element>
  <element name="seCustomConfiguration.03">Patient Care Report Custom Data Type</element>
  <element name="seCustomConfiguration.04">Patient Care Report Custom Data Element Recurrence</element>
  <element name="seCustomConfiguration.05">Patient Care Report Custom Data Element Usage</element>
  <element name="seCustomConfiguration.06">Patient Care Report Custom Data Element Potential Values</element>
  <element name="seCustomConfiguration.07">Patient Care Report Custom Data Element Potential NOT Values (NV)</element>
  <element name="seCustomConfiguration.08">Patient Care Report Custom Data Element Potential Pertinent Negative Values (PN)</element>
  <element name="seCustomConfiguration.09">Patient Care Report Custom Data Element Grouping ID</element>
</nemSch_lookup_elements><?DSDL_INCLUDE_END includes/lookup_elements.xml#nemSch_lookup_elements?>
  </xsl:variable>
  <sch:let name="nemSch_elements" value="$nemSch_lookup_elements//*:nemSch_lookup_elements"/>
  <xsl:key name="nemSch_key_elements" match="nem:element" use="@name"/>

  <!-- PHASES -->
  
  <!-- No phases used. -->

  <!-- PATTERNS -->

  <?DSDL_INCLUDE_START includes/pattern_eNilNvPn.xml?><sch:pattern id="nemSch_eNilNvPn">

  <sch:title>EMSDataSet / Nil/Not Value/Pertinent Negative Attributes</sch:title>

  <sch:rule id="nemSch_eNilNvPn_rule_1" context="nem:eCustomResults.01">

    <!-- This rule fires on eCustomResults.01 to prevent subsequent rules from firing. Nothing is 
    checked. eCustomResults should be validated based on information contained in 
    eCustomConfiguration. -->

    <sch:let name="nemsisElements" value="."/>

    <sch:report role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      This rule enforces no constraints on the combination of xsi:nil, Not Value, and Pertinent Negative attributes on eCustomResults.01.
    </sch:report>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_2" context="nem:eExam.AssessmentGroup//*[@PN]">

    <!-- This rule fires when an element in eExam.AssessmentGroup has a Pertinent Negative 
         attribute to prevent subsequent rules from being fired. Nothing is checked, since the nil and NV attributes are not allowed.  -->

    <sch:let name="nemsisElements" value="."/>

    <sch:report role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      This rule enforces no constraints on the Pertinent Negative attribute on elements in eExam.AssessmentGroup.
    </sch:report>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_3" context="nem:eHistory.10[@PN]">

    <!-- This rule fires when eHistory.10 has a Pertinent Negative attribute to prevent subsequent 
    rules from being fired. Nothing is checked, since the nil and NV attributes are not allowed.  -->

    <sch:let name="nemsisElements" value="."/>

    <sch:report role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      This rule enforces no constraints on the Pertinent Negative attribute on eHistory.10.
    </sch:report>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_4" context="nem:eSituation.01[@PN = '8801023']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e003" role="[ERROR]" diagnostics="nemsisDiagnostic" test="@xsi:nil = 'true' and not(@NV)">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative of "Unable to Complete", it should be empty and it should not have a Not Value (Not Applicable, Not Recorded, or Not Reporting).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_5" context="nem:eSituation.01[@PN = '8801029']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e004" role="[ERROR]" diagnostics="nemsisDiagnostic" test="not(@xsi:nil = 'true') and not(@NV)">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative of "Approximate", it should have a value and it should not have a Not Value (Not Applicable, Not Recorded, or Not Reporting).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_6" context="nem:eSituation.10[@PN]">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e005" role="[ERROR]" diagnostics="nemsisDiagnostic" test="not(@xsi:nil = 'true') and not(@NV)">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative, it should have a value and it should not have a Not Value (Not Applicable, Not Recorded, or Not Reporting).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_7" context="nem:eMedications.03[@PN]">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e006" role="[ERROR]" diagnostics="nemsisDiagnostic" test="not(@xsi:nil = 'true') and not(@NV)">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative, it should have a value and it should not have a Not Value (Not Applicable, Not Recorded, or Not Reporting).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_8" context="nem:eProcedures.03[@PN]">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e007" role="[ERROR]" diagnostics="nemsisDiagnostic" test="not(@xsi:nil = 'true') and not(@NV)">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative, it should have a value and it should not have a Not Value (Not Applicable, Not Recorded, or Not Reporting).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_9" context="*[@PN]">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e008" role="[ERROR]" diagnostics="nemsisDiagnostic" test="@xsi:nil = 'true' and not(@NV)">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative, it should be empty and it should not have a Not Value (Not Applicable, Not Recorded, or Not Reporting).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_10" context="*[@xsi:nil = 'true']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e001" role="[ERROR]" diagnostics="nemsisDiagnostic" test="@NV or @PN">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is empty, it should have a Not Value (Not Applicable, Not Recorded, or Not Reporting, if allowed for the element) or a Pertinent Negative (if allowed for the element), or it should be omitted (if the element is optional).
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNilNvPn_rule_11" context="*[@NV]">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e002" role="[ERROR]" diagnostics="nemsisDiagnostic" test="@xsi:nil='true'">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Not Value (Not Applicable, Not Recorded, or Not Reporting), it should be empty.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eNilNvPn.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eNvPn.xml?><sch:pattern id="nemSch_eNvPn">

  <sch:title>EMSDataSet / Not Value/Pertinent Negative Uniqueness</sch:title>

  <sch:rule id="nemSch_eNvPn_rule_1" context="nem:eCustomResults.01">

    <!-- This rule fires on eCustomResults.01 to prevent subsequent rules from firing. Nothing is 
         checked. eCustomResults should be validated based on information contained in 
         eCustomConfiguration. -->

    <sch:let name="nemsisElements" value="."/>

    <sch:report role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      This rule enforces no constraints on the uniqueness of eCustomResults.01 with Not Value or Pertinent Negative attribute.
    </sch:report>

  </sch:rule>

  <sch:rule id="nemSch_eNvPn_rule_2" context="nem:eExam.AssessmentGroup//*[@PN]">

    <!-- This rule fires when an element in eExam.AssessmentGroup has a Pertinent Negative 
         attribute to prevent subsequent rules from firing. Nothing is checked, since the 
         Pertinent Negative accompanies a value.  -->

    <sch:let name="nemsisElements" value="."/>

    <sch:report role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      This rule enforces no constraints on the uniqueness of elements in eExam.AssessmentGroup with a Pertinent Negative Attribute.
    </sch:report>

  </sch:rule>

  <sch:rule id="nemSch_eNvPn_rule_3" context="nem:eSituation.10[@PN]">

    <!-- This rule fires when an element in eSituation.10 has a Pertinent Negative 
         attribute to prevent subsequent rules from firing. Nothing is checked, since the 
         Pertinent Negative accompanies a value.  -->

    <sch:let name="nemsisElements" value="."/>

    <sch:report role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      This rule enforces no constraints on the uniqueness of elements in eExam.AssessmentGroup with a Pertinent Negative Attribute.
    </sch:report>

  </sch:rule>

  <sch:rule id="nemSch_eNvPn_rule_4" context="*[@NV][local-name() = (local-name(preceding-sibling::*[1]), local-name(following-sibling::*[1]))]">

    <sch:let name="nemsisElements" value="../*[local-name() = local-name(current())]"/>

    <sch:assert id="nemSch_e009" role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Not Value, no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eNvPn_rule_5" context="*[@PN][local-name() = (local-name(preceding-sibling::*[1]), local-name(following-sibling::*[1]))]">

    <sch:let name="nemsisElements" value="../*[local-name() = local-name(current())]"/>

    <sch:assert id="nemSch_e010" role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> has a Pertinent Negative, no other value should be recorded.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eNvPn.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eResponse.xml?><sch:pattern id="nemSch_eResponse">

  <sch:title>EMSDataSet / Unit Agency Information</sch:title>

  <sch:rule id="nemSch_eResponse_rule_1" context="nem:eResponse.01">

    <sch:let name="nemsisElements" value="., ancestor::nem:Header/nem:DemographicGroup/nem:dAgency.02"/>

    <sch:assert id="nemSch_e011" role="[WARNING]" diagnostics="nemsisDiagnostic" test=". = ancestor::nem:Header/nem:DemographicGroup/nem:dAgency.02">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> in the patient care report should match <sch:value-of select="key('nemSch_key_elements', 'dAgency.02', $nemSch_elements)"/> in the agency demographic information.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eResponse_rule_2" context="nem:eResponse.08[. = '2208013'][1]">

    <sch:let name="nemsisElements" value="../nem:eResponse.08"/>

    <sch:assert id="nemSch_e012" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eResponse.08) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None/No Delay", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eResponse_rule_3" context="nem:eResponse.09[. = '2209011'][1]">

    <sch:let name="nemsisElements" value="../nem:eResponse.09"/>

    <sch:assert id="nemSch_e013" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eResponse.09) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None/No Delay", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eResponse_rule_4" context="nem:eResponse.10[. = '2210017'][1]">

    <sch:let name="nemsisElements" value="../nem:eResponse.10"/>

    <sch:assert id="nemSch_e014" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eResponse.10) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None/No Delay", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eResponse_rule_5" context="nem:eResponse.11[. = '2211011'][1]">

    <sch:let name="nemsisElements" value="../nem:eResponse.11"/>

    <sch:assert id="nemSch_e015" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eResponse.11) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None/No Delay", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eResponse_rule_6" context="nem:eResponse.12[. = '2212015'][1]">

    <sch:let name="nemsisElements" value="../nem:eResponse.12"/>

    <sch:assert id="nemSch_e016" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eResponse.12) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None/No Delay", no other value should be recorded.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eResponse.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eTimes.xml?><sch:pattern id="nemSch_eTimes">

  <sch:title>EMSDataSet / Call Event Times Information</sch:title>

  <sch:rule id="nemSch_eTimes_rule_1" context="nem:eTimes.03[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e017" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.01, ." test="../nem:eTimes.01 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.01)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.01', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_2" context="nem:eTimes.05[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e018" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_3" context="nem:eTimes.05[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e019" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_4" context="nem:eTimes.06[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e020" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_5" context="nem:eTimes.06[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e021" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e022" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.05, ." test="../nem:eTimes.05 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.05)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.05', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_6" context="nem:eTimes.07[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e023" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 != '4227001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Patient Contact Made".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_7" context="nem:eTimes.07[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e024" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <!-- eTimes.07 Arrived at Patient Date/Time may occur prior to eTimes.05 Unit En Route Date/Time or eTimes.06 Unit Arrived on Scene Date/Time in cases where a crew member arrived before the unit arrived. -->

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_8" context="nem:eTimes.09[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e025" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_9" context="nem:eTimes.09[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e026" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e027" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.05, ." test="../nem:eTimes.05 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.05)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.05', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e028" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.06, ." test="../nem:eTimes.06 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.06)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.06', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e029" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.07, ." test="../nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.07)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_10" context="nem:eTimes.11[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e030" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_11" context="nem:eTimes.11[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e031" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e032" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.05, ." test="../nem:eTimes.05 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.05)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.05', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e033" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.06, ." test="../nem:eTimes.06 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.06)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.06', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e034" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.07, ." test="../nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.07)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e035" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.09, ." test="../nem:eTimes.09 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.09)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.09', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_12" context="nem:eTimes.12[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e036" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_13" context="nem:eTimes.12[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e037" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e038" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.05, ." test="../nem:eTimes.05 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.05)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.05', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e039" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.06, ." test="../nem:eTimes.06 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.06)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.06', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e040" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.07, ." test="../nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.07)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e041" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.09, ." test="../nem:eTimes.09 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.09)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.09', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e042" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.11, ." test="../nem:eTimes.11 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.11)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.11', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e043" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.01, ." test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.01 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.01)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eSituation.01', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e044" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.18, ." test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.18 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.18)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eSituation.18', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e045" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.14, ." test="ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.14 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.14)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eArrest.14', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eTimes_rule_14" context="nem:eTimes.13[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e046" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e047" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.05, ." test="../nem:eTimes.05 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.05)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.05', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e048" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.06, ." test="../nem:eTimes.06 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.06)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.06', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e049" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.07, ." test="../nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.07)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e050" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.09, ." test="../nem:eTimes.09 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.09)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.09', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e051" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.11, ." test="../nem:eTimes.11 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.11)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.11', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e052" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="nem:eTimes.12, ." test="../nem:eTimes.12 = '' or xs:dateTime(.) &gt;= xs:dateTime(../nem:eTimes.12)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.12', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e053" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.01, ." test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.01 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.01)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eSituation.01', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e054" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.18, ." test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.18 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.18)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eSituation.18', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e055" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.14, ." test="ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.14 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.14)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eArrest.14', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e056" role="[WARNING]" diagnostics="nemsisDiagnostic" test="xs:dateTime(.) &lt;= current-dateTime() + xs:dayTimeDuration('PT1H')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be in the future (the current time according to this system is <sch:value-of select="format-dateTime(current-dateTime(),'[MNn] [D1], [Y0001], [H01]:[m01] [ZN]')"/>).
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eTimes.xml?>
  <?DSDL_INCLUDE_START includes/pattern_ePatient.xml?><sch:pattern id="nemSch_ePatient">

  <sch:title>EMSDataSet / Patient Information</sch:title>

  <sch:rule id="nemSch_ePatient_rule_1" context="nem:ePatient.07[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e057" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_2" context="nem:ePatient.07[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e058" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:ePatient.08" test="starts-with(., ../nem:ePatient.08)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should belong within the <sch:value-of select="key('nemSch_key_elements', 'ePatient.08', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_3" context="nem:ePatient.08[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e059" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_4" context="nem:ePatient.09[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e060" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_5" context="nem:ePatient.13[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e061" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_6" context="nem:ePatient.14[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:ePatient.14"/>

    <sch:assert id="nemSch_e062" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="../nem:ePatient.14 != '' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_7" context="nem:ePatient.15[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e063" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_ePatient_rule_8" context="nem:ePatient.16[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e064" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

    <sch:assert id="nemSch_e065" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="../nem:ePatient.15, ." test="../nem:ePatient.15 = ''">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'ePatient.15', $nemSch_elements)"/> is recorded.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_ePatient.xml?>
  <?DSDL_INCLUDE_START includes/pattern_ePayment.xml?><sch:pattern id="nemSch_ePayment">

  <sch:title>EMSDataSet / Insurance/Payment Information</sch:title>

  <sch:rule id="nemSch_ePayment_rule_1" context="nem:ePayment.01[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e066" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_ePayment.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eScene.xml?><sch:pattern id="nemSch_eScene">

  <sch:title>EMSDataSet / Incident Scene Information</sch:title>

  <sch:rule id="nemSch_eScene_rule_1" context="nem:eScene.06">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e067" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test=". = ('2707001', '2707005') or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 != '4227001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Multiple" or "Single" when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Patient Contact Made".
    </sch:assert>

    <sch:assert id="nemSch_e068" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eScene.07" test=". = '2707001' or ../nem:eScene.07 != '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Multiple" when <sch:value-of select="key('nemSch_key_elements', 'eScene.07', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eScene_rule_2" context="nem:eScene.08[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e069" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eScene.07" test="../nem:eScene.07 != '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eScene.07', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eScene_rule_3" context="nem:eScene.09[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e070" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eScene_rule_4" context="nem:eScene.18[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e071" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eScene_rule_5" context="nem:eScene.19[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e072" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eScene_rule_6" context="nem:eScene.21[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e073" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.27 = '4227005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded unless <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Cancelled Prior to Arrival at Scene".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eScene_rule_7" context="nem:eScene.21[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e074" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eScene.18" test="starts-with(., ../nem:eScene.18)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should belong within the <sch:value-of select="key('nemSch_key_elements', 'eScene.18', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eScene.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eSituation.xml?><sch:pattern id="nemSch_eSituation">

  <sch:title>EMSDataSet / Situation Information</sch:title>

  <sch:rule id="nemSch_eSituation_rule_1" context="nem:eSituation.01[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e075" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_2" context="nem:eSituation.02">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e076" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test=". != '' or ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

    <sch:assert id="nemSch_e077" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../(nem:eSituation.09, nem:eSituation.10, nem:eSituation.11, nem:eSituation.12)" test=". = '9922005' or not(some $element in ../(nem:eSituation.09, nem:eSituation.10, nem:eSituation.11, nem:eSituation.12) satisfies matches($element, '^(S|T(0\d|1[0-4]))'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Yes" when a symptom or impression is injury-related.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_3" context="nem:eSituation.07[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e078" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_4" context="nem:eSituation.08[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e079" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_5" context="nem:eSituation.09[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e080" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_6" context="nem:eSituation.10[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eSituation.10[. != '']"/>

    <sch:assert id="nemSch_e081" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eSituation.09" test="../nem:eSituation.09 != ''">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eSituation.09', $nemSch_elements)"/> is recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_7" context="nem:eSituation.11[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e082" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_8" context="nem:eSituation.12[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eSituation.12[. != '']"/>

    <sch:assert id="nemSch_e083" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eSituation.11" test="../nem:eSituation.11 != ''">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eSituation.11', $nemSch_elements)"/> is recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_9" context="nem:eSituation.13[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e084" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 != '2205001' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "Emergency Response (Primary Response Area)" and <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_10" context="nem:eSituation.18[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e085" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001' or not(ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.01 = ('3001003', '3001005'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e086" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.StrokeScaleGroup/nem:eVitals.29, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001' or not(ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.StrokeScaleGroup/nem:eVitals.29 = '3329005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eVitals.29', $nemSch_elements)"/> is "Positive".
    </sch:assert>

    <sch:assert id="nemSch_e087" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.CardiacRhythmGroup/nem:eVitals.03, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001' or not(ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.CardiacRhythmGroup/nem:eVitals.03 = ('9901051', '9901053', '9901055', '9901057', '9901058'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eVitals.03', $nemSch_elements)"/> is "STEMI...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eSituation_rule_11" context="nem:eSituation.20[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e088" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05" test="ancestor::nem:PatientCareReport/nem:eResponse/nem:eResponse.ServiceGroup/nem:eResponse.05 = ('2205005', '2205007', '2205015', '2205017', '2205019')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eResponse.05', $nemSch_elements)"/> is "... Transfer" or "Other Routine Medical Transport".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eSituation.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eInjury.xml?><sch:pattern id="nemSch_eInjury">

  <sch:title>EMSDataSet / Injury Information</sch:title>

  <sch:rule id="nemSch_eInjury_rule_1" context="nem:eInjury.01[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:eInjury.01"/>

    <sch:assert id="nemSch_e089" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="../nem:eInjury.01 != '' or ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02 != '9922005' or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eSituation.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eInjury_rule_2" context="nem:eInjury.01[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eInjury.01[. != '']"/>

    <sch:assert id="nemSch_e090" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02" test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02 = '9922005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eSituation.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eInjury_rule_3" context="nem:eInjury.03[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eInjury.03[. != '']"/>

    <sch:assert id="nemSch_e091" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02" test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02 = '9922005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eSituation.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eInjury_rule_4" context="nem:eInjury.04[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eInjury.04[. != '']"/>

    <sch:assert id="nemSch_e092" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02" test="ancestor::nem:PatientCareReport/nem:eSituation/nem:eSituation.02 = '9922005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eSituation.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eInjury.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eArrest.xml?><sch:pattern id="nemSch_eArrest">

  <sch:title>EMSDataSet / Cardiac Arrest Information</sch:title>

  <sch:rule id="nemSch_eArrest_rule_1" context="nem:eArrest.02[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e093" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="not(../nem:eArrest.01 = ('3001003', '3001005')) or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_2" context="nem:eArrest.02[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e094" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_3" context="nem:eArrest.03[1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.03"/>

    <sch:assert id="nemSch_e095" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="../nem:eArrest.03 != '' or not(../nem:eArrest.01 = ('3001003', '3001005')) or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e096" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="not(../nem:eArrest.03 != '') or ../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e097" role="[WARNING]" diagnostics="nemsisDiagnostic" test="not(../nem:eArrest.03 = ('3003001', '3003003', '3003005') and ../nem:eArrest.03 = ('3003007', '3003009', '3003011'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not contain both "Attempted/Initiated..." and "Not Attempted...".
    </sch:assert>

    <sch:assert id="nemSch_e098" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.09" test="../nem:eArrest.03 = '3003005' or not(../nem:eArrest.09 = ('3009001', '3009003', '3009005', '3009007', '3009009', '3009011', '3009021'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should contain "Initiated Chest Compressions" when <sch:value-of select="key('nemSch_key_elements', 'eArrest.09', $nemSch_elements)"/> contains "Compressions...".
    </sch:assert>

    <sch:assert id="nemSch_e099" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.09" test="../nem:eArrest.03 = '3003003' or not(../nem:eArrest.09 = ('3009009', '3009013', '3009015', '3009017', '3009019', '3009023', '3009025', '3009027'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should contain "Attempted Ventilation" when <sch:value-of select="key('nemSch_key_elements', 'eArrest.09', $nemSch_elements)"/> contains "Ventilation..." or "Compressions-Intermittent with Ventilation".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_4" context="nem:eArrest.04[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.04"/>

    <sch:assert id="nemSch_e100" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="../nem:eArrest.04 != '' or not(../nem:eArrest.01 = ('3001003', '3001005')) or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_5" context="nem:eArrest.04[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.04[. != '']"/>

    <sch:assert id="nemSch_e101" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e102" role="[WARNING]" diagnostics="nemsisDiagnostic" test="not(../nem:eArrest.04 = '3004001') or count(../nem:eArrest.04) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "Not Witnessed", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_6" context="nem:eArrest.07[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e103" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="not(../nem:eArrest.01 = ('3001003', '3001005')) or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_7" context="nem:eArrest.07[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e104" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_8" context="nem:eArrest.09[1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.09"/>

    <sch:assert id="nemSch_e105" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="not(../nem:eArrest.09 != '') or ../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e106" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.03" test="not(../nem:eArrest.03 = '3003005') or ../nem:eArrest.09 = ('3009001', '3009003', '3009005', '3009007', '3009009', '3009011', '3009021')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should contain "Compressions..." when <sch:value-of select="key('nemSch_key_elements', 'eArrest.03', $nemSch_elements)"/> contains "Initiated Chest Compressions".
    </sch:assert>

    <sch:assert id="nemSch_e107" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.03" test="not(../nem:eArrest.03 = '3003003') or ../nem:eArrest.09 = ('3009009', '3009013', '3009015', '3009017', '3009019', '3009023', '3009025', '3009027')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should contain "Ventilation..." or "Compressions-Intermittent with Ventilation" when <sch:value-of select="key('nemSch_key_elements', 'eArrest.03', $nemSch_elements)"/> contains "Attempted Ventilation".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_9" context="nem:eArrest.12[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.12"/>

    <sch:assert id="nemSch_e108" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="../nem:eArrest.12 != '' or not(../nem:eArrest.01 = ('3001003', '3001005')) or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_10" context="nem:eArrest.12[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.12[. != '']"/>

    <sch:assert id="nemSch_e109" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e110" role="[WARNING]" diagnostics="nemsisDiagnostic" test="not(../nem:eArrest.12 = '3012001') or count(../nem:eArrest.12) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "No", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_11" context="nem:eArrest.14[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e111" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_12" context="nem:eArrest.16[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e112" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_13" context="nem:eArrest.17[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.17"/>

    <sch:assert id="nemSch_e113" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="../nem:eArrest.17 != '' or not(../nem:eArrest.01 = ('3001003', '3001005')) or not(ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230001'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit..." and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_14" context="nem:eArrest.17[. != ''][1]">

    <sch:let name="nemsisElements" value="../nem:eArrest.17[. != '']"/>

    <sch:assert id="nemSch_e114" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_15" context="nem:eArrest.18[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e115" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01, ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="not(../nem:eArrest.01 = ('3001003', '3001005')) or ancestor::nem:PatientCareReport/nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_16" context="nem:eArrest.18[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e116" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_17" context="nem:eArrest.20[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e117" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.03" test="not(../nem:eArrest.03 = ('3003001', '3003003', '3003005'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.03', $nemSch_elements)"/> is "Attempted..." or "Initiated...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_18" context="nem:eArrest.20[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e118" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_19" context="nem:eArrest.21[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e119" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.07" test="not(../nem:eArrest.07 = ('3007003', '3007005'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.07', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_20" context="nem:eArrest.21[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e120" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_21" context="nem:eArrest.22[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e122" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.07" test="not(../nem:eArrest.07 = '3007005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.07', $nemSch_elements)"/> is "Yes, With Defibrillation".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eArrest_rule_22" context="nem:eArrest.22[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e123" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eArrest.01" test="../nem:eArrest.01 = ('3001003', '3001005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should only be recorded when <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eArrest.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eHistory.xml?><sch:pattern id="nemSch_eHistory">

  <sch:title>EMSDataSet / Patient History Information</sch:title>

  <sch:rule id="nemSch_eHistory_rule_1" context="nem:eHistory.01[. = '3101009'][1]">

    <sch:let name="nemsisElements" value="../nem:eHistory.01"/>

    <sch:assert id="nemSch_e124" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eHistory.01) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None Noted", no other value should be recorded.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eHistory.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eVitals.xml?><sch:pattern id="nemSch_eVitals">

  <sch:title>EMSDataSet / Patient Vital Sign Information</sch:title>

  <sch:rule id="nemSch_eVitals_rule_1" context="nem:eVitals.VitalGroup[some $element in .//* satisfies normalize-space($element) != '']/nem:eVitals.01[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e125" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eVitals.02" test="../nem:eVitals.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eVitals.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eVitals_rule_2" context="nem:eVitals.01[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e126" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03, ., ../nem:eVitals.02" test="xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03) or ../nem:eVitals.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>, unless <sch:value-of select="key('nemSch_key_elements', 'eVitals.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

    <sch:assert id="nemSch_e127" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07, ., ../nem:eVitals.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07) or ../nem:eVitals.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>, unless <sch:value-of select="key('nemSch_key_elements', 'eVitals.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

    <sch:assert id="nemSch_e128" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12, ., ../nem:eVitals.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.12', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e129" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13, ., ../nem:eVitals.02" test="xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.13', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e130" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07, ., ../nem:eVitals.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07) or ../nem:eVitals.02 != '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/> when <sch:value-of select="key('nemSch_key_elements', 'eVitals.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eVitals_rule_3" context="nem:eVitals.16[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e131" role="[WARNING]" diagnostics="nemsisDiagnostic" test="xs:decimal(.) &lt;= 100 or not(@ETCO2Type = '3340003')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be no more than 100 when ETCO2 Type is "Percentage".
    </sch:assert>

    <sch:assert id="nemSch_e132" role="[WARNING]" diagnostics="nemsisDiagnostic" test="xs:decimal(.) &lt;= 100 or not(@ETCO2Type = '3340005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be no more than 100 when ETCO2 Type is "kPa".
    </sch:assert>

    <sch:assert id="nemSch_e133" role="[WARNING]" diagnostics="nemsisDiagnostic" test=". castable as xs:integer or not(@ETCO2Type = '3340001')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be an integer when ETCO2 Type is "mmHg".
    </sch:assert>

    <sch:assert id="nemSch_e134" role="[WARNING]" diagnostics="nemsisDiagnostic" test="@ETCO2Type">
      ETCO2 Type should be recorded when <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eVitals_rule_4" context="nem:eVitals.22[. = '3322003'][1]">

    <sch:let name="nemsisElements" value="../nem:eVitals.22"/>

    <sch:assert id="nemSch_e135" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eVitals.22) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "Initial GCS has legitimate values without interventions such as intubation and sedation", no other value should be recorded.
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eVitals.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eMedications.xml?><sch:pattern id="nemSch_eMedications">

  <sch:title>EMSDataSet / Intervention Medications Information</sch:title>

  <sch:rule id="nemSch_eMedications_rule_1" context="nem:eMedications.MedicationGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eMedications.01[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e136" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eMedications.02" test="../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_2" context="nem:eMedications.01[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e137" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03, ., ../nem:eMedications.02" test="xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03) or ../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

    <sch:assert id="nemSch_e138" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07, ., ../nem:eMedications.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07) or ../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

    <sch:assert id="nemSch_e139" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12, ., ../nem:eMedications.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.12', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e140" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13, ., ../nem:eMedications.02" test="xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.13', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e141" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07, ., ../nem:eMedications.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07) or ../nem:eMedications.02 != '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/> when <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_3" context="nem:eMedications.MedicationGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eMedications.03[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e142" role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when a medication is administered.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_4" context="nem:eMedications.03[. != '' and @CodeType]">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e143" role="[ERROR]" diagnostics="nemsisDiagnostic" test="matches(., '^[0-9]{2,7}$') or @CodeType != '9924003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be a code of between 2 and 7 digits when Code Type is "RxNorm".
    </sch:assert>

    <sch:assert id="nemSch_e144" role="[ERROR]" diagnostics="nemsisDiagnostic" test=". = ('116762002', '116795008', '116861002', '116865006', '180208003', '33389009', '71493000') or @CodeType != '9924005'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be a SNOMED code specifically allowed in the data dictionary when Code Type is "SNOMED".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_5" context="nem:eMedications.03[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e145" role="[ERROR]" diagnostics="nemsisDiagnostic" test="matches(., '^[0-9]{2,7}$') or . = ('116762002', '116795008', '116861002', '116865006', '180208003', '33389009', '71493000')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be an RxNorm code of between 2 and 7 digits or a SNOMED code specifically allowed in the data dictionary.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_6" context="nem:eMedications.MedicationGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eMedications.04[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e146" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eMedications.02" test="../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_7" context="nem:eMedications.MedicationGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eMedications.DosageGroup/nem:eMedications.05[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e147" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../../nem:eMedications.02" test="../../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_8" context="nem:eMedications.MedicationGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eMedications.DosageGroup/nem:eMedications.06[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e148" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../../nem:eMedications.02" test="../../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_9" context="nem:eMedications.08[. = '3708031'][1]">

    <sch:let name="nemsisElements" value="../nem:eMedications.08"/>

    <sch:assert id="nemSch_e149" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eMedications.08) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eMedications_rule_10" context="nem:eMedications.MedicationGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eMedications.10[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e150" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eMedications.02" test="../nem:eMedications.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eMedications.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eMedications.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eProcedures.xml?><sch:pattern id="nemSch_eProcedures">

  <sch:title>EMSDataSet / Intervention Procedures Information</sch:title>

  <sch:rule id="nemSch_eProcedures_rule_1" context="nem:eProcedures.ProcedureGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eProcedures.01[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e151" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eProcedures.02" test="../nem:eProcedures.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eProcedures.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eProcedures_rule_2" context="nem:eProcedures.01[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e152" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03, ., ../nem:eProcedures.02" test="xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03) or ../nem:eProcedures.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>, unless <sch:value-of select="key('nemSch_key_elements', 'eProcedures.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

    <sch:assert id="nemSch_e153" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07, ., ../nem:eProcedures.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07 = '' or xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07) or ../nem:eProcedures.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/>, unless <sch:value-of select="key('nemSch_key_elements', 'eProcedures.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

    <sch:assert id="nemSch_e154" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12, ., ../nem:eProcedures.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.12', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e155" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13, ., ../nem:eProcedures.02" test="xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.13', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e156" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07, ., ../nem:eProcedures.02" test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.07) or ../nem:eProcedures.02 != '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.07', $nemSch_elements)"/> when <sch:value-of select="key('nemSch_key_elements', 'eProcedures.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eProcedures_rule_3" context="nem:eProcedures.ProcedureGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eProcedures.03[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e157" role="[WARNING]" diagnostics="nemsisDiagnostic" test="false()">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when a procedure is performed.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eProcedures_rule_4" context="nem:eProcedures.07[. = '3907033'][1]">

    <sch:let name="nemsisElements" value="../nem:eProcedures.07"/>

    <sch:assert id="nemSch_e158" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../nem:eProcedures.07) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "None", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eProcedures_rule_5" context="nem:eProcedures.ProcedureGroup[some $element in .//* satisfies normalize-space($element) != '' and not($element/@PN)]/nem:eProcedures.10[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e159" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eProcedures.02" test="../nem:eProcedures.02 = '9923003'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded, unless <sch:value-of select="key('nemSch_key_elements', 'eProcedures.02', $nemSch_elements)"/> is "Yes".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eProcedures.xml?>
  <?DSDL_INCLUDE_START includes/pattern_eDisposition.xml?><sch:pattern id="nemSch_eDisposition">

  <sch:title>EMSDataSet / Patient Disposition Information</sch:title>

  <sch:rule id="nemSch_eDisposition_rule_1" context="nem:eDisposition.05[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e160" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_2" context="nem:eDisposition.06[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e161" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_3" context="nem:eDisposition.06[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e162" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.05" test="starts-with(., ../nem:eDisposition.05)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should belong within the <sch:value-of select="key('nemSch_key_elements', 'eDisposition.05', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_4" context="nem:eDisposition.07[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e163" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_5" context="nem:eDisposition.16">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e164" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test=". != '' or not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

    <sch:assert id="nemSch_e165" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test=". = '' or not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230009', '4230013'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Patient Refused Transport" or "No Transport".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_6" context="nem:eDisposition.17">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e166" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test=". != '' or not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

    <sch:assert id="nemSch_e167" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test=". = '' or not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230009', '4230013'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Patient Refused Transport" or "No Transport".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_7" context="nem:eDisposition.19[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e168" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_8" context="nem:eDisposition.20[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:eDisposition.20"/>

    <sch:assert id="nemSch_e169" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="../nem:eDisposition.20 != '' or not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_9" context="nem:eDisposition.21[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e170" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30" test="not(ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.30 = ('4230001', '4230003'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is "Transport by This EMS Unit...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_10" context="nem:eDisposition.23[. = ''][1]">

    <sch:let name="nemsisElements" value="../nem:eDisposition.23"/>

    <sch:assert id="nemSch_e171" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.21, ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.01" test="../nem:eDisposition.23 != '' or not(../nem:eDisposition.21 = ('4221003', '4221005', '4221023') and ancestor::nem:PatientCareReport/nem:eArrest/nem:eArrest.01 = ('3001003', '3001005'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.21', $nemSch_elements)"/> is "Hospital..." or "Freestanding Emergency Department" and <sch:value-of select="key('nemSch_key_elements', 'eArrest.01', $nemSch_elements)"/> is "Yes...".
    </sch:assert>

    <sch:assert id="nemSch_e172" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.21, ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.StrokeScaleGroup/nem:eVitals.29" test="../nem:eDisposition.23 != '' or not(../nem:eDisposition.21 = ('4221003', '4221005', '4221023') and ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.StrokeScaleGroup/nem:eVitals.29 = '3329005')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.21', $nemSch_elements)"/> is "Hospital..." or "Freestanding Emergency Department" and <sch:value-of select="key('nemSch_key_elements', 'eVitals.29', $nemSch_elements)"/> is "Positive".
    </sch:assert>

    <sch:assert id="nemSch_e173" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.21, ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.CardiacRhythmGroup/nem:eVitals.03" test="../nem:eDisposition.23 != '' or not(../nem:eDisposition.21 = ('4221003', '4221005', '4221023') and ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup/nem:eVitals.CardiacRhythmGroup/nem:eVitals.03 = ('9901051', '9901053', '9901055', '9901057', '9901058'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.21', $nemSch_elements)"/> is "Hospital..." or "Freestanding Emergency Department" and <sch:value-of select="key('nemSch_key_elements', 'eVitals.03', $nemSch_elements)"/> is "STEMI...".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_11" context="nem:eDisposition.24[. = '4224001'][1]">

    <sch:let name="nemsisElements" value="../../nem:eDisposition.HospitalTeamActivationGroup/nem:eDisposition.24"/>

    <sch:assert id="nemSch_e174" role="[WARNING]" diagnostics="nemsisDiagnostic" test="count(../../nem:eDisposition.HospitalTeamActivationGroup) = 1">
      When <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> is "No", no other value should be recorded.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_12" context="nem:eDisposition.HospitalTeamActivationGroup[* != '']">

    <sch:let name="nemsisElements" value="nem:eDisposition.24, nem:eDisposition.25"/>

    <sch:assert id="nemSch_e175" role="[WARNING]" diagnostics="nemsisDiagnostic" test="nem:eDisposition.24 != ''">
      <sch:value-of select="key('nemSch_key_elements', 'eDisposition.24', $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.25', $nemSch_elements)"/> is recorded.
    </sch:assert>

    <sch:assert id="nemSch_e176" role="[WARNING]" diagnostics="nemsisDiagnostic" test="nem:eDisposition.25 != '' or nem:eDisposition.24 = '4224001'">
      <sch:value-of select="key('nemSch_key_elements', 'eDisposition.25', $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.24', $nemSch_elements)"/> is recorded with a value other than "None".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_13" context="nem:eDisposition.25[. != '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e177" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03, ." test="xs:dateTime(.) &gt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.03)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be earlier than <sch:value-of select="key('nemSch_key_elements', 'eTimes.03', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e178" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12, ." test="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12 = '' or xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.12)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.12', $nemSch_elements)"/>.
    </sch:assert>

    <sch:assert id="nemSch_e179" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13, ." test="xs:dateTime(.) &lt;= xs:dateTime(ancestor::nem:PatientCareReport/nem:eTimes/nem:eTimes.13)">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should not be later than <sch:value-of select="key('nemSch_key_elements', 'eTimes.13', $nemSch_elements)"/>.
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_14" context="nem:eDisposition.27">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e180" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.28" test=". = '4227001' or not(../nem:eDisposition.28 = ('4228001', '4228003', '4228005', '4228007'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Patient Contact Made" when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated..." or "Patient Refused Evaluation/Care".
    </sch:assert>

    <sch:assert id="nemSch_e181" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.29" test=". = '4227001' or not(../nem:eDisposition.29 = ('4229001', '4229003', '4229005', '4229007'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Patient Contact Made" when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.29', $nemSch_elements)"/> contains "... Primary Care..." or "Provided Care Supporting Primary EMS Crew".
    </sch:assert>

    <sch:assert id="nemSch_e182" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.30" test=". = '4227001' or ../nem:eDisposition.30 = ('', '4229011', '4229013')">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Patient Contact Made" when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.30', $nemSch_elements)"/> is a value other than "Non-Patient Transport (Not Otherwise Listed)" or "No Transport".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_15" context="nem:eDisposition.28">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e183" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.27" test=". != '' or ../nem:eDisposition.27 != '4227001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Patient Contact Made".
    </sch:assert>

    <sch:assert id="nemSch_e184" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.29" test=". = '4228001' or not(../nem:eDisposition.29 = ('4229001', '4229003', '4229005', '4229007'))">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be "Patient Evaluated and Care Provided" when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.29', $nemSch_elements)"/> contains "... Primary Care..." or "Provided Care Supporting Primary EMS Crew".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_16" context="nem:eDisposition.29[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e185" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.27" test="../nem:eDisposition.27 != '4227001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Patient Contact Made".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_17" context="nem:eDisposition.30[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e186" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ../nem:eDisposition.27" test="../nem:eDisposition.27 != '4227001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.27', $nemSch_elements)"/> is "Patient Contact Made".
    </sch:assert>

  </sch:rule>

  <sch:rule id="nemSch_eDisposition_rule_18" context="nem:eDisposition.32[. = '']">

    <sch:let name="nemsisElements" value="."/>

    <sch:assert id="nemSch_e187" role="[WARNING]" diagnostics="nemsisDiagnostic" subject="., ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28" test="ancestor::nem:eDisposition/nem:eDisposition.IncidentDispositionGroup/nem:eDisposition.28 != '4228001'">
      <sch:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/> should be recorded (with a value other than "No Care Provided") when <sch:value-of select="key('nemSch_key_elements', 'eDisposition.28', $nemSch_elements)"/> is "Patient Evaluated and Care Provided".
    </sch:assert>

  </sch:rule>

</sch:pattern><?DSDL_INCLUDE_END includes/pattern_eDisposition.xml?>

  <!-- DIAGNOSTICS -->

  <sch:diagnostics>

    <?DSDL_INCLUDE_START includes/diagnostic_nemsisDiagnostic.xml?><sch:diagnostic id="nemsisDiagnostic">

  <!-- This is the NEMSIS national diagnostic. It must exist in every NEMSIS Schematron document, 
       and it should be referenced by every assert and report. It provides nationally-
       standardized, structured data to communicate which data elements are of interest in a 
       failed assert or successful report. -->

  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

    <!-- Elements that uniquely identify the record where the problem happened. -->

    <record>
      <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
      <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
      <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
      <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
      <xsl:if test="ancestor-or-self::*[@UUID]">
        <UUID><xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/></UUID>
      </xsl:if>
    </record>

    <!-- Elements that the user may want to revisit to resolve the problem, along with their values. -->

    <elements>
      <xsl:for-each select="$nemsisElements">
        <xsl:element name="element">
          <xsl:attribute name="location">
            <xsl:apply-templates select="." mode="schematron-get-full-path"/>
          </xsl:attribute>
          <xsl:for-each select="@*">
            <xsl:attribute name="{name()}">
              <xsl:value-of select="."/>
            </xsl:attribute>
          </xsl:for-each>
          <xsl:if test="not(*)">
            <xsl:value-of select="."/>
          </xsl:if>
        </xsl:element>
      </xsl:for-each>
    </elements>

    <!-- Elements that were missing, that the user may want to visit to resolve the problem. -->

    <elementsMissing>
      <xsl:variable name="default_context" select="."/>
      <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
        <xsl:variable name="parent" select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
        <element>
          <xsl:attribute name="parentLocation">
            <xsl:choose>
              <xsl:when test="$parent">
                <xsl:apply-templates select="$parent" mode="schematron-get-full-path"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:apply-templates select="$default_context" mode="schematron-get-full-path"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:attribute name="name">
            <xsl:value-of select="."/>
          </xsl:attribute>
        </element>
      </xsl:for-each>
    </elementsMissing>

  </nemsisDiagnostic>

</sch:diagnostic><?DSDL_INCLUDE_END includes/diagnostic_nemsisDiagnostic.xml?>

  </sch:diagnostics>

  <!-- PROPERTIES -->

  <sch:properties/>

</sch:schema>