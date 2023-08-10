<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="../utilities/html/schematronHtml.xsl"?>
<sch:schema xmlns:sch="http://purl.oclc.org/dsdl/schematron"
            xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
            queryBinding="xslt2"
            id="EMSDataSet"
            schemaVersion="3.5.0.211008CP3_compliance_pre_2023">
   <sch:title>NEMSIS ISO Schematron file for EMSDataSet for Compliance Pre-testing (2023, v3.5.0)</sch:title>
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
      <sch:title>Arkansas driver license numbers match the Arkansas format</sch:title>
      <sch:rule id="compliance_driver_license_format_rule"
                context="nem:ePatient.21[../nem:ePatient.20 = '05']">
         <sch:let name="nemsisElements" value="., ../nem:ePatient.20"/>
         <!-- To test: Change a personnel's Arkansas (ePatient.20) driver license number (ePatient.21) to a value that does not match the format of 4 to 9 digits. -->
         <sch:assert id="compliance_driver_license_format_assert"
                     role="[ERROR]"
                     diagnostics="nemsisDiagnostic"
                     test="matches(normalize-space(.), '^\d{4,9}$')">
        Driver's License Number should be 4 to 9 digits when State Issuing Driver's License is "Arkansas". This is a validation message for compliance pre-testing for 2023 for NEMSIS v3.5.0.
      </sch:assert>
      </sch:rule>
   </sch:pattern>
   <sch:pattern id="compliance_nitro_bp">
      <sch:title>SBP (Systolic Blood Pressure) should be recorded before each administration of nitroglycerin, with a value of at least 100.</sch:title>
      <sch:rule id="compliance_nitro_bp_rule"
                context="nem:eMedications.MedicationGroup[nem:eMedications.01 != '' and nem:eMedications.02 = '9923001' and nem:eMedications.03[. = '4917' and not(@PN)]]">
         <sch:let name="previousNitro"
                  value="../nem:eMedications.MedicationGroup[nem:eMedications.01 != '' and nem:eMedications.01 &lt; current()/nem:eMedications.01 and nem:eMedications.02 = '9923001' and nem:eMedications.03[. = '4917'] and not (@PN)]"/>
         <sch:let name="previousSBP"
                  value="ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup[nem:eVitals.01 != '' and nem:eVitals.01 &lt;= current()/nem:eMedications.01 and nem:eVitals.BloodPressureGroup/nem:eVitals.06 != '']"/>
         <sch:let name="nemsisElements"
                  value="ancestor::nem:PatientCareReport/nem:eVitals/nem:eVitals.VitalGroup[nem:eVitals.01 != '' and nem:eVitals.01 &lt; current()/nem:eMedications.01]/nem:eVitals.BloodPressureGroup/nem:eVitals.06[. = '']"/>
         <sch:let name="nemsisElementsMissing"
                  value=".[not($nemsisElements)]/'eVitals.06'"/>
         <sch:let name="nemsisElementsMissingContext"
                  value=".[not($nemsisElements)]/ancestor::nem:PatientCareReport/nem:eVitals"/>
         <!-- To test: On case 2021-EMS-5-STEMIFlight_v350, clear out eVitals.06 SBP (Systolic Blood Pressure), or change it to less than 100, in a set of vital signs taken between two administrations of nitroglycerin (eMedications.03 code '4917'). -->
         <sch:assert id="compliance_nitro_bp_assert"
                     role="[WARNING]"
                     diagnostics="nemsisDiagnostic"
                     test="$previousSBP[(every $instance in $previousNitro/nem:eMedications.01 satisfies nem:eVitals.01 &gt; $instance) and nem:eVitals.BloodPressureGroup/nem:eVitals.06 &gt;= 100]">
        SBP (Systolic Blood Pressure) should be recorded before each administration of nitroglycerin, with a value of at least 100. This is a validation message for compliance pre-testing for 2023 for NEMSIS v3.5.0.
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
