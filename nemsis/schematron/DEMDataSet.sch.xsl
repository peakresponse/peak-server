<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xsl:stylesheet xmlns:iso="http://purl.oclc.org/dsdl/schematron"
                xmlns:nem="http://www.nemsis.org"
                xmlns:saxon="http://saxon.sf.net/"
                xmlns:schold="http://www.ascc.net/xml/schematron"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="2.0"><!--Implementers: please note that overriding process-prolog or process-root is 
    the preferred method for meta-stylesheets to use where possible. -->
   <xsl:param name="archiveDirParameter"/>
   <xsl:param name="archiveNameParameter"/>
   <xsl:param name="fileNameParameter"/>
   <xsl:param name="fileDirParameter"/>
   <xsl:variable name="document-uri">
      <xsl:value-of select="document-uri(/)"/>
   </xsl:variable>
   <!--PHASES-->
   <!--PROLOG-->
   <xsl:output xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
               method="xml"
               omit-xml-declaration="no"
               standalone="yes"
               indent="yes"/>
   <!--XSD TYPES FOR XSLT2-->
   <!--KEYS AND FUNCTIONS-->
   <xsl:key name="nemSch_key_elements" match="nem:element" use="@name"/>
   <!--DEFAULT RULES-->
   <!--MODE: SCHEMATRON-SELECT-FULL-PATH-->
   <!--This mode can be used to generate an ugly though full XPath for locators-->
   <xsl:template match="*" mode="schematron-select-full-path">
      <xsl:apply-templates select="." mode="schematron-get-full-path"/>
   </xsl:template>
   <!--MODE: SCHEMATRON-FULL-PATH-->
   <!--This mode can be used to generate an ugly though full XPath for locators-->
   <xsl:template match="*" mode="schematron-get-full-path">
      <xsl:apply-templates select="parent::*" mode="schematron-get-full-path"/>
      <xsl:text>/</xsl:text>
      <xsl:choose>
         <xsl:when test="namespace-uri()=''">
            <xsl:value-of select="name()"/>
         </xsl:when>
         <xsl:otherwise>
            <xsl:text>*:</xsl:text>
            <xsl:value-of select="local-name()"/>
            <xsl:text>[namespace-uri()='</xsl:text>
            <xsl:value-of select="namespace-uri()"/>
            <xsl:text>']</xsl:text>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:variable name="preceding"
                    select="count(preceding-sibling::*[local-name()=local-name(current())                                   and namespace-uri() = namespace-uri(current())])"/>
      <xsl:text>[</xsl:text>
      <xsl:value-of select="1+ $preceding"/>
      <xsl:text>]</xsl:text>
   </xsl:template>
   <xsl:template match="@*" mode="schematron-get-full-path">
      <xsl:apply-templates select="parent::*" mode="schematron-get-full-path"/>
      <xsl:text>/</xsl:text>
      <xsl:choose>
         <xsl:when test="namespace-uri()=''">@<xsl:value-of select="name()"/>
         </xsl:when>
         <xsl:otherwise>
            <xsl:text>@*[local-name()='</xsl:text>
            <xsl:value-of select="local-name()"/>
            <xsl:text>' and namespace-uri()='</xsl:text>
            <xsl:value-of select="namespace-uri()"/>
            <xsl:text>']</xsl:text>
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
   <!--MODE: SCHEMATRON-FULL-PATH-2-->
   <!--This mode can be used to generate prefixed XPath for humans-->
   <xsl:template match="node() | @*" mode="schematron-get-full-path-2">
      <xsl:for-each select="ancestor-or-self::*">
         <xsl:text>/</xsl:text>
         <xsl:value-of select="name(.)"/>
         <xsl:if test="preceding-sibling::*[name(.)=name(current())]">
            <xsl:text>[</xsl:text>
            <xsl:value-of select="count(preceding-sibling::*[name(.)=name(current())])+1"/>
            <xsl:text>]</xsl:text>
         </xsl:if>
      </xsl:for-each>
      <xsl:if test="not(self::*)">
         <xsl:text/>/@<xsl:value-of select="name(.)"/>
      </xsl:if>
   </xsl:template>
   <!--MODE: SCHEMATRON-FULL-PATH-3-->
   <!--This mode can be used to generate prefixed XPath for humans 
	(Top-level element has index)-->
   <xsl:template match="node() | @*" mode="schematron-get-full-path-3">
      <xsl:for-each select="ancestor-or-self::*">
         <xsl:text>/</xsl:text>
         <xsl:value-of select="name(.)"/>
         <xsl:if test="parent::*">
            <xsl:text>[</xsl:text>
            <xsl:value-of select="count(preceding-sibling::*[name(.)=name(current())])+1"/>
            <xsl:text>]</xsl:text>
         </xsl:if>
      </xsl:for-each>
      <xsl:if test="not(self::*)">
         <xsl:text/>/@<xsl:value-of select="name(.)"/>
      </xsl:if>
   </xsl:template>
   <!--MODE: GENERATE-ID-FROM-PATH -->
   <xsl:template match="/" mode="generate-id-from-path"/>
   <xsl:template match="text()" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.text-', 1+count(preceding-sibling::text()), '-')"/>
   </xsl:template>
   <xsl:template match="comment()" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.comment-', 1+count(preceding-sibling::comment()), '-')"/>
   </xsl:template>
   <xsl:template match="processing-instruction()" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.processing-instruction-', 1+count(preceding-sibling::processing-instruction()), '-')"/>
   </xsl:template>
   <xsl:template match="@*" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.@', name())"/>
   </xsl:template>
   <xsl:template match="*" mode="generate-id-from-path" priority="-0.5">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:text>.</xsl:text>
      <xsl:value-of select="concat('.',name(),'-',1+count(preceding-sibling::*[name()=name(current())]),'-')"/>
   </xsl:template>
   <!--MODE: GENERATE-ID-2 -->
   <xsl:template match="/" mode="generate-id-2">U</xsl:template>
   <xsl:template match="*" mode="generate-id-2" priority="2">
      <xsl:text>U</xsl:text>
      <xsl:number level="multiple" count="*"/>
   </xsl:template>
   <xsl:template match="node()" mode="generate-id-2">
      <xsl:text>U.</xsl:text>
      <xsl:number level="multiple" count="*"/>
      <xsl:text>n</xsl:text>
      <xsl:number count="node()"/>
   </xsl:template>
   <xsl:template match="@*" mode="generate-id-2">
      <xsl:text>U.</xsl:text>
      <xsl:number level="multiple" count="*"/>
      <xsl:text>_</xsl:text>
      <xsl:value-of select="string-length(local-name(.))"/>
      <xsl:text>_</xsl:text>
      <xsl:value-of select="translate(name(),':','.')"/>
   </xsl:template>
   <!--Strip characters-->
   <xsl:template match="text()" priority="-1"/>
   <!--SCHEMA SETUP-->
   <xsl:template match="/">
      <svrl:schematron-output xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                              title="NEMSIS National ISO Schematron file for DEMDataSet"
                              schemaVersion="3.5.0.211008CP3">
         <xsl:comment>
            <xsl:value-of select="$archiveDirParameter"/>   
		 <xsl:value-of select="$archiveNameParameter"/>  
		 <xsl:value-of select="$fileNameParameter"/>  
		 <xsl:value-of select="$fileDirParameter"/>
         </xsl:comment>
         <svrl:ns-prefix-in-attribute-values uri="http://www.nemsis.org" prefix="nem"/>
         <svrl:ns-prefix-in-attribute-values uri="http://www.w3.org/2001/XMLSchema-instance" prefix="xsi"/>
         <svrl:active-pattern>
            <xsl:attribute name="document">
               <xsl:value-of select="document-uri(/)"/>
            </xsl:attribute>
            <xsl:attribute name="id">nemSch_dNilNvPn</xsl:attribute>
            <xsl:attribute name="name">DEMDataSet / Nil/Not Value Attributes</xsl:attribute>
            <xsl:apply-templates/>
         </svrl:active-pattern>
         <xsl:apply-templates select="/" mode="M9"/>
         <svrl:active-pattern>
            <xsl:attribute name="document">
               <xsl:value-of select="document-uri(/)"/>
            </xsl:attribute>
            <xsl:attribute name="id">nemSch_dNvPn</xsl:attribute>
            <xsl:attribute name="name">DEMDataSet / Not Value/Pertinent Negative Uniqueness</xsl:attribute>
            <xsl:apply-templates/>
         </svrl:active-pattern>
         <xsl:apply-templates select="/" mode="M10"/>
         <svrl:active-pattern>
            <xsl:attribute name="document">
               <xsl:value-of select="document-uri(/)"/>
            </xsl:attribute>
            <xsl:attribute name="id">nemSch_uuid</xsl:attribute>
            <xsl:attribute name="name">DEMDataSet / UUIDs</xsl:attribute>
            <xsl:apply-templates/>
         </svrl:active-pattern>
         <xsl:apply-templates select="/" mode="M11"/>
         <svrl:active-pattern>
            <xsl:attribute name="document">
               <xsl:value-of select="document-uri(/)"/>
            </xsl:attribute>
            <xsl:attribute name="id">nemSch_DemographicReport</xsl:attribute>
            <xsl:attribute name="name">DEMDataSet / Demographic Report</xsl:attribute>
            <xsl:apply-templates/>
         </svrl:active-pattern>
         <xsl:apply-templates select="/" mode="M12"/>
         <svrl:active-pattern>
            <xsl:attribute name="document">
               <xsl:value-of select="document-uri(/)"/>
            </xsl:attribute>
            <xsl:attribute name="id">nemSch_dAgency</xsl:attribute>
            <xsl:attribute name="name">DEMDataSet / Agency Information</xsl:attribute>
            <xsl:apply-templates/>
         </svrl:active-pattern>
         <xsl:apply-templates select="/" mode="M13"/>
         <svrl:active-pattern>
            <xsl:attribute name="document">
               <xsl:value-of select="document-uri(/)"/>
            </xsl:attribute>
            <xsl:attribute name="id">nemSch_dConfiguration</xsl:attribute>
            <xsl:attribute name="name">DEMDataSet / Configuration Information</xsl:attribute>
            <xsl:apply-templates/>
         </svrl:active-pattern>
         <xsl:apply-templates select="/" mode="M14"/>
      </svrl:schematron-output>
   </xsl:template>
   <!--SCHEMATRON PATTERNS-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">NEMSIS National ISO Schematron file for DEMDataSet</svrl:text>
   <xsl:param name="nemsisElements" select="()"/>
   <xsl:param name="nemsisElementsMissing" select="''"/>
   <xsl:param name="nemsisElementsMissingContext" select="()"/>
   <xsl:variable xmlns:sch="http://purl.oclc.org/dsdl/schematron"
                 name="nemSch_lookup_elements">
      <nemSch_lookup_elements xmlns="http://www.nemsis.org" xml:id="nemSch_lookup_elements">
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
      </nemSch_lookup_elements>
   </xsl:variable>
   <xsl:param name="nemSch_elements"
              select="$nemSch_lookup_elements//*:nemSch_lookup_elements"/>
   <!--PATTERN nemSch_dNilNvPnDEMDataSet / Nil/Not Value Attributes-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">DEMDataSet / Nil/Not Value Attributes</svrl:text>
   <!--RULE nemSch_dNilNvPn_rule_1-->
   <xsl:template match="nem:dCustomResults.01" priority="1002" mode="M9">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dCustomResults.01"
                       id="nemSch_dNilNvPn_rule_1"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--REPORT [WARNING]-->
      <xsl:if test="false()">
         <svrl:successful-report xmlns:svrl="http://purl.oclc.org/dsdl/svrl" test="false()">
            <xsl:attribute name="role">[WARNING]</xsl:attribute>
            <xsl:attribute name="location">
               <xsl:apply-templates select="." mode="schematron-select-full-path"/>
            </xsl:attribute>
            <svrl:text>
      This rule enforces no constraints on the combination of xsi:nil, Not Value, and Pertinent Negative attributes on dCustomResults.01.
    </svrl:text>
            <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
               <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                  <record>
                     <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                     <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                     <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                     <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                     <xsl:if test="ancestor-or-self::*[@UUID]">
                        <UUID>
                           <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                        </UUID>
                     </xsl:if>
                  </record>
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
                  <elementsMissing>
                     <xsl:variable name="default_context" select="."/>
                     <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                        <xsl:variable name="parent"
                                      select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
            </svrl:diagnostic-reference>
         </svrl:successful-report>
      </xsl:if>
      <xsl:apply-templates select="*" mode="M9"/>
   </xsl:template>
   <!--RULE nemSch_dNilNvPn_rule_2-->
   <xsl:template match="*[@xsi:nil = 'true']" priority="1001" mode="M9">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="*[@xsi:nil = 'true']"
                       id="nemSch_dNilNvPn_rule_2"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="@NV"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl" test="@NV">
               <xsl:attribute name="id">nemSch_d001</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
      When <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> is empty, it should have a Not Value (Not Applicable, Not Recorded, or Not Reporting, if allowed for the element), or it should be omitted (if the element is optional).
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M9"/>
   </xsl:template>
   <!--RULE nemSch_dNilNvPn_rule_3-->
   <xsl:template match="*[@NV]" priority="1000" mode="M9">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="*[@NV]"
                       id="nemSch_dNilNvPn_rule_3"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="@xsi:nil='true'"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl" test="@xsi:nil='true'">
               <xsl:attribute name="id">nemSch_d002</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
      When <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> has a Not Value (Not Applicable, Not Recorded, or Not Reporting), it should be empty.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M9"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M9"/>
   <xsl:template match="@*|node()" priority="-2" mode="M9">
      <xsl:apply-templates select="*" mode="M9"/>
   </xsl:template>
   <!--PATTERN nemSch_dNvPnDEMDataSet / Not Value/Pertinent Negative Uniqueness-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">DEMDataSet / Not Value/Pertinent Negative Uniqueness</svrl:text>
   <!--RULE nemSch_dNvPn_rule_1-->
   <xsl:template match="nem:dCustomResults.01" priority="1001" mode="M10">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dCustomResults.01"
                       id="nemSch_dNvPn_rule_1"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--REPORT [WARNING]-->
      <xsl:if test="false()">
         <svrl:successful-report xmlns:svrl="http://purl.oclc.org/dsdl/svrl" test="false()">
            <xsl:attribute name="role">[WARNING]</xsl:attribute>
            <xsl:attribute name="location">
               <xsl:apply-templates select="." mode="schematron-select-full-path"/>
            </xsl:attribute>
            <svrl:text>
      This rule enforces no constraints on the uniqueness of dCustomResults.01 with Not Value or Pertinent Negative attribute.
    </svrl:text>
            <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
               <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                  <record>
                     <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                     <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                     <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                     <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                     <xsl:if test="ancestor-or-self::*[@UUID]">
                        <UUID>
                           <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                        </UUID>
                     </xsl:if>
                  </record>
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
                  <elementsMissing>
                     <xsl:variable name="default_context" select="."/>
                     <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                        <xsl:variable name="parent"
                                      select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
            </svrl:diagnostic-reference>
         </svrl:successful-report>
      </xsl:if>
      <xsl:apply-templates select="*" mode="M10"/>
   </xsl:template>
   <!--RULE nemSch_dNvPn_rule_2-->
   <xsl:template match="*[@NV][local-name() = (local-name(preceding-sibling::*[1]), local-name(following-sibling::*[1]))]"
                 priority="1000"
                 mode="M10">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="*[@NV][local-name() = (local-name(preceding-sibling::*[1]), local-name(following-sibling::*[1]))]"
                       id="nemSch_dNvPn_rule_2"/>
      <xsl:variable name="nemsisElements"
                    select="../*[local-name() = local-name(current())]"/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test="false()"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl" test="false()">
               <xsl:attribute name="id">nemSch_d003</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
      When <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> has a Not Value, no other value should be recorded.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M10"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M10"/>
   <xsl:template match="@*|node()" priority="-2" mode="M10">
      <xsl:apply-templates select="*" mode="M10"/>
   </xsl:template>
   <!--PATTERN nemSch_uuidDEMDataSet / UUIDs-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">DEMDataSet / UUIDs</svrl:text>
   <!--RULE nemSch_uuid_rule_1-->
   <xsl:template match="*[@UUID]" priority="1000" mode="M11">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="*[@UUID]"
                       id="nemSch_uuid_rule_1"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="count(ancestor::nem:DemographicReport//*[@UUID = current()/@UUID]) = 1"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="count(ancestor::nem:DemographicReport//*[@UUID = current()/@UUID]) = 1">
               <xsl:attribute name="id">nemSch_d005</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
      UUID must be universally unique.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M11"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M11"/>
   <xsl:template match="@*|node()" priority="-2" mode="M11">
      <xsl:apply-templates select="*" mode="M11"/>
   </xsl:template>
   <!--PATTERN nemSch_DemographicReportDEMDataSet / Demographic Report-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">DEMDataSet / Demographic Report</svrl:text>
   <!--RULE nemSch_DemographicReport_rule_1-->
   <xsl:template match="nem:DemographicReport" priority="1000" mode="M12">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:DemographicReport"
                       id="nemSch_DemographicReport_rule_1"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="xs:dateTime(@timeStamp) &lt; current-dateTime() + xs:dayTimeDuration('PT1H')"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="xs:dateTime(@timeStamp) &lt; current-dateTime() + xs:dayTimeDuration('PT1H')">
               <xsl:attribute name="id">nemSch_d004</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
      The timestamp of the DemographicReport should not be in the future (the current time according to this system is <xsl:text/>
                  <xsl:value-of select="format-dateTime(current-dateTime(),'[MNn] [D1], [Y0001], [H01]:[m01] [ZN]')"/>
                  <xsl:text/>).
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M12"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M12"/>
   <xsl:template match="@*|node()" priority="-2" mode="M12">
      <xsl:apply-templates select="*" mode="M12"/>
   </xsl:template>
   <!--PATTERN nemSch_dAgencyDEMDataSet / Agency Information-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">DEMDataSet / Agency Information</svrl:text>
   <!--RULE nemSch_dAgency_rule_1-->
   <xsl:template match="nem:dAgency.06" priority="1002" mode="M13">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dAgency.06"
                       id="nemSch_dAgency_rule_1"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="substring(., 1, 2) = ../nem:dAgency.05"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="substring(., 1, 2) = ../nem:dAgency.05">
               <xsl:attribute name="id">nemSch_d006</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should belong to the state with which it is grouped.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M13"/>
   </xsl:template>
   <!--RULE nemSch_dAgency_rule_2-->
   <xsl:template match="nem:dAgency.07[. != '']" priority="1001" mode="M13">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dAgency.07[. != '']"
                       id="nemSch_dAgency_rule_2"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test="substring(., 1, 5) = ../nem:dAgency.06"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="substring(., 1, 5) = ../nem:dAgency.06">
               <xsl:attribute name="id">nemSch_d007</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should belong to a county recorded in <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.06', $nemSch_elements)"/>
                  <xsl:text/> in the state with which it is grouped.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M13"/>
   </xsl:template>
   <!--RULE nemSch_dAgency_rule_3-->
   <xsl:template match="nem:dAgency.13" priority="1000" mode="M13">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dAgency.13"
                       id="nemSch_dAgency_rule_3"/>
      <xsl:variable name="nemsisElements" select="., ../nem:dAgency.26"/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test=". != '9912001' or ../nem:dAgency.26 != ''"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test=". != '9912001' or ../nem:dAgency.26 != ''">
               <xsl:attribute name="id">nemSch_d008</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.26', $nemSch_elements)"/>
                  <xsl:text/> should be recorded when <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> is "Fire Department".
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test=". = '9912001' or not(../nem:dAgency.26 != '')"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test=". = '9912001' or not(../nem:dAgency.26 != '')">
               <xsl:attribute name="id">nemSch_d009</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.26', $nemSch_elements)"/>
                  <xsl:text/> should only be recorded when <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> is "Fire Department".
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M13"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M13"/>
   <xsl:template match="@*|node()" priority="-2" mode="M13">
      <xsl:apply-templates select="*" mode="M13"/>
   </xsl:template>
   <!--PATTERN nemSch_dConfigurationDEMDataSet / Configuration Information-->
   <svrl:text xmlns:svrl="http://purl.oclc.org/dsdl/svrl">DEMDataSet / Configuration Information</svrl:text>
   <!--RULE nemSch_dConfiguration_rule_1-->
   <xsl:template match="nem:dAgency.04" priority="1005" mode="M14">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dAgency.04"
                       id="nemSch_dConfiguration_rule_1"/>
      <xsl:variable name="nemsisElements"
                    select="., ancestor-or-self::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01"/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test=". = ancestor-or-self::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test=". = ancestor-or-self::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01">
               <xsl:attribute name="id">nemSch_d010</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
      There should be a configuration group where <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dConfiguration.01', $nemSch_elements)"/>
                  <xsl:text/> is the state recorded in <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/>.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
   <!--RULE nemSch_dConfiguration_rule_2-->
   <xsl:template match="nem:dConfiguration.01" priority="1004" mode="M14">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dConfiguration.01"
                       id="nemSch_dConfiguration_rule_2"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test="not(. = ../preceding-sibling::nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01)"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="not(. = ../preceding-sibling::nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01)">
               <xsl:attribute name="id">nemSch_d011</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should be unique (the same state should not be listed more than once).
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
   <!--RULE nemSch_dConfiguration_rule_3-->
   <xsl:template match="nem:dAgency[nem:dAgency.04 = ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01]"
                 priority="1003"
                 mode="M14">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dAgency[nem:dAgency.04 = ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup/nem:dConfiguration.01]"
                       id="nemSch_dConfiguration_rule_3"/>
      <xsl:variable name="nemsisElements"
                    select="nem:dAgency.04, nem:dAgency.11, ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup[nem:dConfiguration.01 = current()/nem:dAgency.04]/(nem:dConfiguration.01, nem:dConfiguration.ProcedureGroup/nem:dConfiguration.06, nem:dConfiguration.MedicationGroup/nem:dConfiguration.08)"/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test="nem:dAgency.11 = ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup[nem:dConfiguration.01 = current()/nem:dAgency.04]/nem:dConfiguration.ProcedureGroup/nem:dConfiguration.06"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="nem:dAgency.11 = ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup[nem:dConfiguration.01 = current()/nem:dAgency.04]/nem:dConfiguration.ProcedureGroup/nem:dConfiguration.06">
               <xsl:attribute name="id">nemSch_d012</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dConfiguration.06', $nemSch_elements)"/>
                  <xsl:text/>, within the configuration group for the state recorded in <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.04', $nemSch_elements)"/>
                  <xsl:text/>, should include the level recorded in <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.11', $nemSch_elements)"/>
                  <xsl:text/>.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test="nem:dAgency.11 = ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup[nem:dConfiguration.01 = current()/nem:dAgency.04]/nem:dConfiguration.MedicationGroup/nem:dConfiguration.08"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="nem:dAgency.11 = ancestor::nem:DemographicReport/nem:dConfiguration/nem:dConfiguration.ConfigurationGroup[nem:dConfiguration.01 = current()/nem:dAgency.04]/nem:dConfiguration.MedicationGroup/nem:dConfiguration.08">
               <xsl:attribute name="id">nemSch_d013</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dConfiguration.08', $nemSch_elements)"/>
                  <xsl:text/>, within the configuration group for the state recorded in <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.04', $nemSch_elements)"/>
                  <xsl:text/>, should include the level recorded in <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', 'dAgency.11', $nemSch_elements)"/>
                  <xsl:text/>.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
   <!--RULE nemSch_dConfiguration_rule_4-->
   <xsl:template match="nem:dConfiguration.09[. != '' and @CodeType]"
                 priority="1002"
                 mode="M14">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dConfiguration.09[. != '' and @CodeType]"
                       id="nemSch_dConfiguration_rule_4"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="matches(., '^[0-9]{2,7}$') or @CodeType != '9924003'"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="matches(., '^[0-9]{2,7}$') or @CodeType != '9924003'">
               <xsl:attribute name="id">nemSch_d014</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should be a code of between 2 and 7 digits when Code Type is "RxNorm".
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test=". = ('116762002', '116795008', '116861002', '116865006', '180208003', '33389009', '71493000') or @CodeType != '9924005'"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test=". = ('116762002', '116795008', '116861002', '116865006', '180208003', '33389009', '71493000') or @CodeType != '9924005'">
               <xsl:attribute name="id">nemSch_d015</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should be a SNOMED code specifically allowed in the data dictionary when Code Type is "SNOMED".
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
   <!--RULE nemSch_dConfiguration_rule_5-->
   <xsl:template match="nem:dConfiguration.09[. != '']" priority="1001" mode="M14">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dConfiguration.09[. != '']"
                       id="nemSch_dConfiguration_rule_5"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [ERROR]-->
      <xsl:choose>
         <xsl:when test="matches(., '^[0-9]{2,7}$') or . = ('116762002', '116795008', '116861002', '116865006', '180208003', '33389009', '71493000')"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="matches(., '^[0-9]{2,7}$') or . = ('116762002', '116795008', '116861002', '116865006', '180208003', '33389009', '71493000')">
               <xsl:attribute name="id">nemSch_d016</xsl:attribute>
               <xsl:attribute name="role">[ERROR]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should be an RxNorm code of between 2 and 7 digits or a SNOMED code specifically allowed in the data dictionary.
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
   <!--RULE nemSch_dConfiguration_rule_6-->
   <xsl:template match="nem:dConfiguration.16" priority="1000" mode="M14">
      <svrl:fired-rule xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                       context="nem:dConfiguration.16"
                       id="nemSch_dConfiguration_rule_6"/>
      <xsl:variable name="nemsisElements" select="."/>
      <!--ASSERT [WARNING]-->
      <xsl:choose>
         <xsl:when test="not(. = preceding-sibling::nem:dConfiguration.16)"/>
         <xsl:otherwise>
            <svrl:failed-assert xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                                test="not(. = preceding-sibling::nem:dConfiguration.16)">
               <xsl:attribute name="id">nemSch_d017</xsl:attribute>
               <xsl:attribute name="role">[WARNING]</xsl:attribute>
               <xsl:attribute name="location">
                  <xsl:apply-templates select="." mode="schematron-select-full-path"/>
               </xsl:attribute>
               <svrl:text>
                  <xsl:text/>
                  <xsl:value-of select="key('nemSch_key_elements', local-name(), $nemSch_elements)"/>
                  <xsl:text/> should be unique (the same call sign should not be listed more than once).
    </svrl:text>
               <svrl:diagnostic-reference diagnostic="nemsisDiagnostic">
                  <nemsisDiagnostic xmlns="http://www.nemsis.org" xmlns:sch="http://purl.oclc.org/dsdl/schematron">
                     <record>
                        <xsl:copy-of select="ancestor-or-self::*:StateDataSet/*:sState/*:sState.01"/>
                        <xsl:copy-of select="ancestor-or-self::*:DemographicReport/*:dAgency/(*:dAgency.01 | *:dAgency.02 | *:dAgency.04)"/>
                        <xsl:copy-of select="ancestor-or-self::*:Header/*:DemographicGroup/*"/>
                        <xsl:copy-of select="ancestor-or-self::*:PatientCareReport/*:eRecord/*:eRecord.01"/>
                        <xsl:if test="ancestor-or-self::*[@UUID]">
                           <UUID>
                              <xsl:value-of select="ancestor-or-self::*[@UUID][1]/@UUID"/>
                           </UUID>
                        </xsl:if>
                     </record>
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
                     <elementsMissing>
                        <xsl:variable name="default_context" select="."/>
                        <xsl:for-each select="tokenize($nemsisElementsMissing, ' ')">
                           <xsl:variable name="parent"
                                         select="$nemsisElementsMissingContext[contains(local-name(), substring-before(current(), '.'))][1]"/>
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
               </svrl:diagnostic-reference>
            </svrl:failed-assert>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M14"/>
   <xsl:template match="@*|node()" priority="-2" mode="M14">
      <xsl:apply-templates select="*" mode="M14"/>
   </xsl:template>
</xsl:stylesheet>
