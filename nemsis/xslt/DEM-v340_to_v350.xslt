<?xml version="1.0" encoding="UTF-8"?>

<!--

XML Stylesheet Language Transformation (XSLT) to transform NEMSIS DEMDataSet from v3.4.0 to v3.5.0

Version: 3.4.0.200910CP2_3.5.0.191130CP1_201106
Revision Date: November 6, 2020

-->

<xsl:stylesheet version="2.0"
	xmlns="http://www.nemsis.org"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:n="http://www.nemsis.org"
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	exclude-result-prefixes="n">

  <xsl:output method="xml" encoding="UTF-8" indent="yes"/>

  <xsl:attribute-set name="NotRecorded">
    <xsl:attribute name="xsi:nil" namespace="http://www.w3.org/2001/XMLSchema-instance">true</xsl:attribute>
    <xsl:attribute name="NV">7701003</xsl:attribute>
  </xsl:attribute-set>

  <xsl:template match="/">
    <xsl:comment>&#32;This NEMSIS 3.5.0 document was generated from a NEMSIS 3.4.0 document via an XML Stylesheet Language Transformation (XSLT). It is not valid per the NEMSIS 3.5.0 XSD due to lack of support to UUIDs (see the NEMSIS V3 UUID Guide for more information).&#32;</xsl:comment>
    <xsl:text>&#10;</xsl:text>
    <xsl:copy>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="@xsi:schemaLocation">
    <xsl:attribute name="xsi:schemaLocation">http://www.nemsis.org http://www.nemsis.org/media/nemsis_v3/release-3.5.0/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd</xsl:attribute>
  </xsl:template>

  <!-- dState: Remove -->
  <xsl:template match="n:dState"/>

  <!-- @CorrelationID, @CustomElementID, dCustomConfiguration.09, dCustomResults.02, dCustomResults.03: pad if length is less than 2 -->
  <xsl:template match="@CorrelationID[string-length(.) &lt; 2] |
                       @CustomElementID[string-length(.) &lt; 2] |
                       n:dCustomConfiguration.09[string-length(.) &lt; 2] |
                       n:dCustomResults.02[string-length(.) &lt; 2] |
                       n:dCustomResults.03[string-length(.) &lt; 2]">
    <xsl:copy>
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:copy>
  </xsl:template>

  <!-- dCustomConfiguration.02: pad if length is less than 2 -->
  <xsl:template match="n:dCustomConfiguration.02[string-length(.) &lt; 2]">
    <xsl:copy>
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:copy>
  </xsl:template>

  <!-- dAgency.11, dConfiguration.06, dConfiguration.08, dVehicle.05: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:dAgency.11[. = '9917009'] | 
                       n:dConfiguration.06[. = '9917009'] | 
                       n:dConfiguration.08[. = '9917009'] | 
                       n:dVehicle.05[. = '9917009']">
    <xsl:copy>9917003</xsl:copy>
  </xsl:template>

  <!-- dAgency.11, dConfiguration.06, dConfiguration.08, dVehicle.05: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:dAgency.11[. = '9917011'] | 
                       n:dConfiguration.06[. = '9917011'] | 
                       n:dConfiguration.08[. = '9917011'] | 
                       n:dVehicle.05[. = '9917011']">
    <xsl:copy>9917005</xsl:copy>
  </xsl:template>

  <!-- dAgency.11, dConfiguration.06, dConfiguration.08, dVehicle.05: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:dAgency.11[. = '9917013'] | 
                       n:dConfiguration.06[. = '9917013'] | 
                       n:dConfiguration.08[. = '9917013'] | 
                       n:dVehicle.05[. = '9917013']">
    <xsl:copy>9917002</xsl:copy>
  </xsl:template>

  <!-- dAgency.11, dConfiguration.06, dConfiguration.08, dVehicle.05: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:dAgency.11[. = '9917015'] | 
                       n:dConfiguration.06[. = '9917015'] | 
                       n:dConfiguration.08[. = '9917015'] | 
                       n:dVehicle.05[. = '9917015']">
    <xsl:copy>9917007</xsl:copy>
  </xsl:template>

  <!-- dConfiguration.02: Remove -->
  <xsl:template match="n:dConfiguration.02"/>

  <!-- dConfiguration.03: Remove -->
  <xsl:template match="n:dConfiguration.03"/>

  <!-- dConfiguration.04: Remove -->
  <xsl:template match="n:dConfiguration.04"/>

  <!-- dConfiguration.05: Remove -->
  <xsl:template match="n:dConfiguration.05"/>

  <!-- dConfiguration.09: Set @CodeType to "RxNorm" -->
  <xsl:template match="n:dConfiguration.09">
    <xsl:copy>
      <xsl:attribute name="CodeType">9924003</xsl:attribute>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- dPersonnel.24, dPersonnel.38: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:dPersonnel.24[. = '9925013'] | 
                       n:dPersonnel.38[. = '9925013']">
    <xsl:copy>9925003</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.24, dPersonnel.38: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:dPersonnel.24[. = '9925015'] | 
                       n:dPersonnel.38[. = '9925015']">
    <xsl:copy>9925005</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.24, dPersonnel.38: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:dPersonnel.24[. = '9925017'] | 
                       n:dPersonnel.38[. = '9925017']">
    <xsl:copy>9925002</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.24, dPersonnel.38: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:dPersonnel.24[. = '9925019'] | 
                       n:dPersonnel.38[. = '9925019']">
    <xsl:copy>9925007</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.29: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:dPersonnel.29[. = '1529009']">
    <xsl:copy>1529005</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.29: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:dPersonnel.29[. = '1529011']">
    <xsl:copy>1529002</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.29: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:dPersonnel.29[. = '1529013']">
    <xsl:copy>1529007</xsl:copy>
  </xsl:template>

  <!-- dPersonnel.29: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:dPersonnel.29[. = '1529015']">
    <xsl:copy>1529003</xsl:copy>
  </xsl:template>

  <!-- dFacility.04: Map "Stroke Center" to "Not Recorded" -->
  <xsl:template match="n:dFacility.04[. = '9908017']">
    <xsl:copy use-attribute-sets="NotRecorded"/>
  </xsl:template>

</xsl:stylesheet>
