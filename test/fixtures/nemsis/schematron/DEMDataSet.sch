<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="../utilities/html/schematronHtml.xsl"?>
<sch:schema xmlns:sch="http://purl.oclc.org/dsdl/schematron"
            xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
            queryBinding="xslt2"
            id="DEMDataSet"
            schemaVersion="3.5.0.211008CP3_compliance_pre_2023">
   <sch:title>NEMSIS ISO Schematron file for DEMDataSet for Compliance Pre-testing (2023, v3.5.0)</sch:title>
   <sch:ns prefix="nem" uri="http://www.nemsis.org"/>
   <sch:ns prefix="xsi" uri="http://www.w3.org/2001/XMLSchema-instance"/>
   <!-- "Initialize" variables used by nemsisDiagnostic. -->
   <sch:let name="nemsisElements" value="()"/>
   <sch:let name="nemsisElementsMissing" value="''"/>
   <sch:let name="nemsisElementsMissingContext" value="()"/>
   <!-- PHASES -->
   <!-- No phases used. -->
   <!-- PATTERNS -->
   <sch:pattern id="compliance_driver_license_format">
      <sch:title>Arkansas Class D driver license numbers match the Arkansas format.</sch:title>
      <sch:rule id="compliance_driver_license_format_rule"
                context="nem:dCustomResults.ResultsGroup[nem:dCustomResults.01 != '' and nem:dCustomResults.02 = 'arPersonnel.02']">
         <sch:let name="nemsisElements" value="nem:dCustomResults.01"/>
         <!-- To test: Change a personnel's Arkansas Class D driver license number (in custom element arPersonnel.02) to a value that does not match the format of 4 to 9 digits. -->
         <sch:let name="dPersonnel.17"
                  value="ancestor::nem:DemographicReport/nem:dPersonnel/nem:dPersonnel.PersonnelGroup[@CorrelationID = current()/nem:dCustomResults.03]/nem:dPersonnel.17"/>
         <sch:let name="arPersonnel.01"
                  value="ancestor::nem:dCustomResults/nem:dCustomResults.ResultsGroup[nem:dCustomResults.02 = 'arPersonnel.01' and nem:dCustomResults.03 = current()/nem:dCustomResults.03]/nem:dCustomResults.01"/>
         <sch:assert id="compliance_driver_license_format_assert"
                     role="[WARNING]"
                     diagnostics="nemsisDiagnostic"
                     test="not($dPersonnel.17 = '1517013') or not($arPersonnel.01 = '05') or matches(normalize-space(nem:dCustomResults.01), '^\d{4,9}$')">
        EMS Personnel's Driver License Number (for Arkansas Class D licenses) should be 4 to 9 digits. This is a validation message for compliance pre-testing for 2023 for NEMSIS v3.5.0.
      </sch:assert>
      </sch:rule>
   </sch:pattern>
   <sch:pattern id="compliance_personnel_work_email_format">
      <sch:title>EMS Personnel's Work Email Address should match the expected format.</sch:title>
      <sch:rule id="compliance_personnel_work_email_format_rule"
                context="nem:dPersonnel.10[@EmailAddressType = '9904003']">
         <sch:let name="nemsisElements" value="."/>
         <!-- To test: Change a personnel's work email address to something other than the personnel's [firstname].[lastname]@... -->
         <sch:assert id="compliance_personnel_work_email_format_assert"
                     role="[WARNING]"
                     diagnostics="nemsisDiagnostic"
                     test="starts-with(lower-case(normalize-space(.)), lower-case(../nem:dPersonnel.NameGroup/(string-join((normalize-space(nem:dPersonnel.02), normalize-space(nem:dPersonnel.01)), '.'))))">
        EMS Personnel's Work Email Address should be in the format "[firstname].[lastname]@...". This is a validation message for compliance pre-testing for 2023 for NEMSIS v3.5.0.
      </sch:assert>
      </sch:rule>
   </sch:pattern>
   <sch:pattern id="compliance_911Service">
      <sch:title>Primary Type of Service or Other Types of Service should be certain values based on EMS Agency Number.</sch:title>
      <sch:rule id="compliance_911Service_rule"
                context="nem:dAgency[starts-with(nem:dAgency.02, '350')]">
         <sch:let name="nemsisElements"
                  value="nem:dAgency.02, nem:dAgency.09, nem:dAgency.10"/>
         <!-- To test: Change dAgency.09 Primary Type of Service to something other than "911 Response (Scene) with Transport Capability". -->
         <sch:assert id="compliance_911Service_assert"
                     role="[ERROR]"
                     diagnostics="nemsisDiagnostic"
                     test="(nem:dAgency.09, nem:dAgency.10) = '9920001'">
        Primary Type of Service or Other Types of Service should include "911 Response (Scene) with Transport Capability" when EMS Agency Number begins with "350". This is a validation message for compliance pre-testing for 2023 for NEMSIS v3.5.0.
      </sch:assert>
      </sch:rule>
   </sch:pattern>
   <!-- DIAGNOSTICS -->
   <sch:diagnostics>

    <?DSDL_INCLUDE_START includes/diagnostic_nemsisDiagnostic.xml?>
      <sch:diagnostic id="nemsisDiagnostic">

      <!-- This is the NEMSIS national diagnostic. It must exist in every NEMSIS Schematron document, 
          and it should be referenced by every assert and report. It provides nationally-
          standardized, structured data to communicate which data elements are of interest in a 
          failed assert or successful report. -->
         <nemsisDiagnostic xmlns="http://www.nemsis.org"
                           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    
        <!-- Elements that uniquely identify the record where the problem happened. -->
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
      </sch:diagnostic>
      <?DSDL_INCLUDE_END includes/diagnostic_nemsisDiagnostic.xml?>
   </sch:diagnostics>
   <!-- PROPERTIES -->
   <sch:properties/>
</sch:schema>
