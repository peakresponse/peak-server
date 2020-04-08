<?xml version="1.0" encoding="UTF-8"?>

<!--

XML Stylesheet Language Transformation (XSLT) to transform NEMSIS StateDataSet from v3.4.0 to v3.5.0

Version: 3.4.0.160713CP2_3.5.0.191130CP1_200206
Revision Date: February 6, 2020

-->

<xsl:stylesheet version="2.0"
	xmlns="http://www.nemsis.org"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:n="http://www.nemsis.org"
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	exclude-result-prefixes="n xs">

  <xsl:output method="xml" encoding="UTF-8" indent="yes"/>

  <xsl:attribute-set name="NotRecorded">
    <xsl:attribute name="xsi:nil" namespace="http://www.w3.org/2001/XMLSchema-instance">true</xsl:attribute>
    <xsl:attribute name="NV">7701003</xsl:attribute>
  </xsl:attribute-set>

  <xsl:key name="key_element_names" match="n:element" use="@v340"/>

  <xsl:template match="/">
    <xsl:comment>&#32;This NEMSIS 3.5.0 document was generated from a NEMSIS 3.4.0 document via an XML Stylesheet Language Transformation (XSLT).&#32;</xsl:comment>
    <xsl:text>&#10;</xsl:text>
    <xsl:copy>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="@* | node()" priority="-1">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="@xsi:schemaLocation">
    <xsl:attribute name="xsi:schemaLocation">http://www.nemsis.org http://www.nemsis.org/media/nemsis_v3/release-3.5.0/XSDs/NEMSIS_XSDs/StateDataSet_v3.xsd</xsl:attribute>
  </xsl:template>

  <!-- Elements: Map element name -->
  <xsl:template match="element()">
    <xsl:element name="{n:name(.)}">
      <xsl:apply-templates select="@* | node()"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="n:StateDataSet">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <!-- dConfiguration.01: Enclose in sState -->
      <sState>
        <xsl:apply-templates select="n:dConfiguration.01"/>
      </sState>
      <!-- dCustomConfiguration, eCustomConfiguration: Switch order -->
      <xsl:apply-templates select="n:eCustomConfiguration"/>
      <xsl:apply-templates select="n:dCustomConfiguration"/>
      <!-- Insert sSoftware -->
      <sSoftware>
        <sSoftware.SoftwareGroup>
          <sSoftware.01>NEMSIS Technical Assistance Center</sSoftware.01>
          <sSoftware.02>NEMSIS XSL Translation</sSoftware.02>
          <sSoftware.03>3.4.0.160713CP2_3.5.0.191130CP1_200206</sSoftware.03>
        </sSoftware.SoftwareGroup>
      </sSoftware>
      <!-- dState.01, eState.01: Combine -->
      <sElement>
        <xsl:apply-templates select="n:eState/n:eState.01"/>
        <xsl:apply-templates select="n:dState/n:dState.01"/>
        <!-- Insert blank sElement.01 if there are no instances of eState.01 or dState.01 -->
        <xsl:if test="not(n:eState/n:eState.01 or n:dState/n:dState.01)">
          <sElement.01 xsi:nil="true" NV="7701003"/>
        </xsl:if>
      </sElement>
        <!-- dConfiguration: Insert sConfiguration with required children if missing -->
      <xsl:apply-templates select="n:dConfiguration"/>
      <xsl:if test="not(n:dConfiguration)">
        <sConfiguration>
          <sConfiguration.01 xsi:nil="true" NV="7701001"/>
          <sConfiguration.ProcedureGroup>
            <sConfiguration.02 xsi:nil="true" NV="7701003"/>
            <sConfiguration.03 xsi:nil="true" NV="7701003"/>
          </sConfiguration.ProcedureGroup>
          <sConfiguration.MedicationGroup>
            <sConfiguration.04 xsi:nil="true" NV="7701003"/>
            <sConfiguration.05 xsi:nil="true" NV="7701003"/>
          </sConfiguration.MedicationGroup>
          <sConfiguration.06 xsi:nil="true" NV="7701003"/>
        </sConfiguration>
      </xsl:if>
      <xsl:apply-templates select="n:dAgency"/>
      <xsl:apply-templates select="n:dFacility"/>
    </xsl:copy>
  </xsl:template>

  <!-- eCustomConfiguration.CustomGroup: Insert mandatory/required children if missing -->
  <xsl:template match="n:eCustomConfiguration.CustomGroup">
    <xsl:element name="{n:name(.)}">
      <xsl:apply-templates select="@*"/>
      <xsl:choose>
        <xsl:when test="n:eCustomConfiguration.01">
          <xsl:apply-templates select="n:eCustomConfiguration.01"/>
        </xsl:when>
        <xsl:otherwise>
          <seCustomConfiguration.01>{Custom Data Element Title Missing}</seCustomConfiguration.01>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eCustomConfiguration.02[. != '']">
          <xsl:apply-templates select="n:eCustomConfiguration.02"/>
        </xsl:when>
        <xsl:otherwise>
          <seCustomConfiguration.02>{Custom Data Element Definition Missing}</seCustomConfiguration.02>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eCustomConfiguration.03">
          <xsl:apply-templates select="n:eCustomConfiguration.03"/>
        </xsl:when>
        <xsl:otherwise>
          <!-- seCustomConfiguration.03: Set to "Text/String" if missing -->
          <seCustomConfiguration.03>9902009</seCustomConfiguration.03>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eCustomConfiguration.04">
          <xsl:apply-templates select="n:eCustomConfiguration.04"/>
        </xsl:when>
        <xsl:otherwise>
          <!-- seCustomConfiguration.04: Set to "Yes" if missing -->
          <seCustomConfiguration.04>9923003</seCustomConfiguration.04>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eCustomConfiguration.05">
          <xsl:apply-templates select="n:eCustomConfiguration.05"/>
        </xsl:when>
        <xsl:otherwise>
          <!-- seCustomConfiguration.05: Set to "Optional" if missing -->
          <seCustomConfiguration.05>9903007</seCustomConfiguration.05>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="n:eCustomConfiguration.06"/>
      <xsl:apply-templates select="n:eCustomConfiguration.07"/>
      <xsl:apply-templates select="n:eCustomConfiguration.08"/>
      <xsl:apply-templates select="n:eCustomConfiguration.09"/>
    </xsl:element>
  </xsl:template>

  <!-- dCustomConfiguration.CustomGroup: Insert mandatory children if missing -->
  <xsl:template match="n:dCustomConfiguration.CustomGroup">
    <xsl:element name="{n:name(.)}">
      <xsl:apply-templates select="@*"/>
      <xsl:choose>
        <xsl:when test="n:dCustomConfiguration.01">
          <xsl:apply-templates select="n:dCustomConfiguration.01"/>
        </xsl:when>
        <xsl:otherwise>
          <sdCustomConfiguration.01>{Custom Data Element Title Missing}</sdCustomConfiguration.01>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dCustomConfiguration.02[. != '']">
          <xsl:apply-templates select="n:dCustomConfiguration.02"/>
        </xsl:when>
        <xsl:otherwise>
          <sdCustomConfiguration.02>{Custom Data Element Definition Missing}</sdCustomConfiguration.02>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dCustomConfiguration.03">
          <xsl:apply-templates select="n:dCustomConfiguration.03"/>
        </xsl:when>
        <xsl:otherwise>
          <!-- sdCustomConfiguration.03: Set to "Text/String" if missing -->
          <sdCustomConfiguration.03>9902009</sdCustomConfiguration.03>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dCustomConfiguration.04">
          <xsl:apply-templates select="n:dCustomConfiguration.04"/>
        </xsl:when>
        <xsl:otherwise>
          <!-- sdCustomConfiguration.04: Set to "Yes" if missing -->
          <sdCustomConfiguration.04>9923003</sdCustomConfiguration.04>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dCustomConfiguration.05">
          <xsl:apply-templates select="n:dCustomConfiguration.05"/>
        </xsl:when>
        <xsl:otherwise>
          <!-- sdCustomConfiguration.05: Set to "Optional" if missing -->
          <sdCustomConfiguration.05>9903007</sdCustomConfiguration.05>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="n:dCustomConfiguration.06"/>
      <xsl:apply-templates select="n:dCustomConfiguration.07"/>
      <xsl:apply-templates select="n:dCustomConfiguration.08"/>
      <xsl:apply-templates select="n:dCustomConfiguration.09"/>
    </xsl:element>
  </xsl:template>

  <!-- dState.01/@TIMESTAMP, eState.01/@TIMESTAMP: Remove -->
  <xsl:template match="n:dState.01/@TIMESTAMP |
                       n:eState.01/@TIMESTAMP"/>

  <!-- @CustomElementID: pad if length is less than 2 -->
  <xsl:template match="@CustomElementID[string-length(.) &lt; 2]">
    <xsl:attribute name="CustomElementID">
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:attribute>
  </xsl:template>

  <!-- (d|e)CustomConfiguration.09: pad if length is less than 2 -->
  <xsl:template match="n:eCustomConfiguration.09[string-length(.) &lt; 2] |
                       n:dCustomConfiguration.09[string-length(.) &lt; 2]">
    <xsl:element name="{n:name(.)}">
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:element>
  </xsl:template>

  <!-- dConfiguration: Insert required children if missing-->
  <xsl:template match="n:dConfiguration">
    <xsl:element name="{n:name(.)}">
      <xsl:choose>
        <xsl:when test="n:dConfiguration.02">
          <xsl:apply-templates select="n:dConfiguration.02"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.01 xsi:nil="true" NV="7701001"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dConfiguration.ProcedureGroup">
          <xsl:apply-templates select="n:dConfiguration.ProcedureGroup"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.ProcedureGroup>
            <sConfiguration.02 xsi:nil="true" NV="7701001"/>
            <sConfiguration.03 xsi:nil="true" NV="7701001"/>
          </sConfiguration.ProcedureGroup>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dConfiguration.MedicationGroup">
          <xsl:apply-templates select="n:dConfiguration.MedicationGroup"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.MedicationGroup>
            <sConfiguration.04 xsi:nil="true" NV="7701001"/>
            <sConfiguration.05 xsi:nil="true" NV="7701001"/>
          </sConfiguration.MedicationGroup>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dConfiguration.05">
          <xsl:apply-templates select="n:dConfiguration.05"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.06 xsi:nil="true" NV="7701001"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <!-- dConfiguration.02: Map from LicenseLevels to StateCertificationLicensureLevels data type -->
  <xsl:template match="n:dConfiguration.02">
    <xsl:element name="{n:name(.)}">
      <xsl:choose>
        <!--  2009 Advanced Emergency Medical Technician (AEMT) => Advanced Emergency Medical Technician (AEMT) -->
        <xsl:when test=". = '9911001'">9917001</xsl:when>
        <!--  2009 Emergency Medical Responder (EMR) => Emergency Medical Responder (EMR) -->
        <xsl:when test=". = '9911003'">9917003</xsl:when>
        <!--  2009 Emergency Medical Technician (EMT) => Emergency Medical Technician (EMT) -->
        <xsl:when test=". = '9911005'">9917005</xsl:when>
        <!--  2009 Paramedic => Paramedic -->
        <xsl:when test=". = '9911007'">9917007</xsl:when>
        <!--  EMT-Basic => Emergency Medical Technician (EMT) -->
        <xsl:when test=". = '9911009'">9917005</xsl:when>
        <!--  EMT-Intermediate => Emergency Medical Technician - Intermediate -->
        <xsl:when test=". = '9911011'">9917002</xsl:when>
        <!--  EMT-Paramedic => Paramedic -->
        <xsl:when test=". = '9911013'">9917007</xsl:when>
        <!--  First Responder => Emergency Medical Responder (EMR) -->
        <xsl:when test=". = '9911015'">9917003</xsl:when>
        <!--  Other => Not Recorded -->
        <xsl:when test=". = '9911019'">
          <xsl:attribute name="xsi:nil">true</xsl:attribute>
          <xsl:attribute name="NV">7701003</xsl:attribute>
        </xsl:when>
        <!--  Physician -->
        <xsl:when test=". = '9911021'">9917019</xsl:when>
        <!--  Critical Care Paramedic -->
        <xsl:when test=". = '9911023'">9917021</xsl:when>
        <!--  Community Paramedicine -->
        <xsl:when test=". = '9911025'">9917023</xsl:when>
        <!--  Nurse Practitioner -->
        <xsl:when test=". = '9911027'">9917025</xsl:when>
        <!--  Physician Assistant -->
        <xsl:when test=". = '9911029'">9917027</xsl:when>
        <!--  Licensed Practical Nurse (LPN) -->
        <xsl:when test=". = '9911031'">9917029</xsl:when>
        <!--  Registered Nurse -->
        <xsl:when test=". = '9911033'">9917031</xsl:when>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <!-- dConfiguration.ProcedureGroup: Insert required children if missing-->
  <xsl:template match="n:dConfiguration.ProcedureGroup">
    <xsl:element name="{n:name(.)}">
      <xsl:choose>
        <xsl:when test="n:dConfiguration.06">
          <xsl:apply-templates select="n:dConfiguration.06"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.02 xsi:nil="true" NV="7701001"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dConfiguration.03">
          <xsl:apply-templates select="n:dConfiguration.03"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.03 xsi:nil="true" NV="7701001"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <!-- dConfiguration.MedicationGroup: Insert required children if missing-->
  <xsl:template match="n:dConfiguration.MedicationGroup">
    <xsl:element name="{n:name(.)}">
      <xsl:choose>
        <xsl:when test="n:dConfiguration.08">
          <xsl:apply-templates select="n:dConfiguration.08"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.04 xsi:nil="true" NV="7701001"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:dConfiguration.04">
          <xsl:apply-templates select="n:dConfiguration.04"/>
        </xsl:when>
        <xsl:otherwise>
          <sConfiguration.05 xsi:nil="true" NV="7701001"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <!-- dConfiguration.04: Set @CodeType to "RxNorm" if not empty -->
  <xsl:template match="n:dConfiguration.04[. != '']">
    <xsl:element name="{n:name(.)}">
      <xsl:attribute name="CodeType">9924003</xsl:attribute>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:element>
  </xsl:template>

  <!-- dConfiguration.06, dConfiguration.08: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:dConfiguration.06[. = '9917009'] | 
                       n:dConfiguration.08[. = '9917009']">
    <xsl:element name="{n:name(.)}">9917003</xsl:element>
  </xsl:template>

  <!-- dConfiguration.06, dConfiguration.08: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:dConfiguration.06[. = '9917011'] | 
                       n:dConfiguration.08[. = '9917011']">
    <xsl:element name="{n:name(.)}">9917005</xsl:element>
  </xsl:template>

  <!-- dConfiguration.06, dConfiguration.08: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:dConfiguration.06[. = '9917013'] | 
                       n:dConfiguration.08[. = '9917013']">
    <xsl:element name="{n:name(.)}">9917002</xsl:element>
  </xsl:template>

  <!-- dConfiguration.06, dConfiguration.08: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:dConfiguration.06[. = '9917015'] | 
                       n:dConfiguration.08[. = '9917015']">
    <xsl:element name="{n:name(.)}">9917007</xsl:element>
  </xsl:template>

  <!-- dFacility.04: Map "Stroke Center" to "Not Recorded" -->
  <xsl:template match="n:dFacility.04[. = '9908017']">
    <xsl:element name="{n:name(.)}"  use-attribute-sets="NotRecorded"/>
  </xsl:template>

  <!-- dFacility.15/@CorrelationID: Remove -->
  <xsl:template match="n:dFacility.15/@CorrelationID"/>

  <!-- Elements: Map element name -->
  <xsl:function name="n:name" as="xs:string">
    <xsl:param name="element" as="node()"/>
    <xsl:value-of select="(key('key_element_names', local-name($element), $element_names)/@v350, local-name($element))[1]"/>
  </xsl:function>

  <!-- Element name mapping variable -->
  <xsl:variable name="element_names">
    <element v340="dConfiguration.01"                 v350="sState.01"/>
    <element v340="dCustomConfiguration"              v350="sdCustomConfiguration"/>
    <element v340="dCustomConfiguration.CustomGroup"  v350="sdCustomConfiguration.CustomGroup"/>
    <element v340="dCustomConfiguration.01"           v350="sdCustomConfiguration.01"/>
    <element v340="dCustomConfiguration.02"           v350="sdCustomConfiguration.02"/>
    <element v340="dCustomConfiguration.03"           v350="sdCustomConfiguration.03"/>
    <element v340="dCustomConfiguration.04"           v350="sdCustomConfiguration.04"/>
    <element v340="dCustomConfiguration.05"           v350="sdCustomConfiguration.05"/>
    <element v340="dCustomConfiguration.06"           v350="sdCustomConfiguration.06"/>
    <element v340="dCustomConfiguration.07"           v350="sdCustomConfiguration.07"/>
    <element v340="dCustomConfiguration.08"           v350="sdCustomConfiguration.08"/>
    <element v340="dCustomConfiguration.09"           v350="sdCustomConfiguration.09"/>
    <element v340="eCustomConfiguration"              v350="seCustomConfiguration"/>
    <element v340="eCustomConfiguration.CustomGroup"  v350="seCustomConfiguration.CustomGroup"/>
    <element v340="eCustomConfiguration.01"           v350="seCustomConfiguration.01"/>
    <element v340="eCustomConfiguration.02"           v350="seCustomConfiguration.02"/>
    <element v340="eCustomConfiguration.03"           v350="seCustomConfiguration.03"/>
    <element v340="eCustomConfiguration.04"           v350="seCustomConfiguration.04"/>
    <element v340="eCustomConfiguration.05"           v350="seCustomConfiguration.05"/>
    <element v340="eCustomConfiguration.06"           v350="seCustomConfiguration.06"/>
    <element v340="eCustomConfiguration.07"           v350="seCustomConfiguration.07"/>
    <element v340="eCustomConfiguration.08"           v350="seCustomConfiguration.08"/>
    <element v340="eCustomConfiguration.09"           v350="seCustomConfiguration.09"/>
    <element v340="dState.01"                         v350="sElement.01"/>
    <element v340="eState.01"                         v350="sElement.01"/>
    <element v340="dConfiguration"                    v350="sConfiguration"/>
    <element v340="dConfiguration.02"                 v350="sConfiguration.01"/>
    <element v340="dConfiguration.ProcedureGroup"     v350="sConfiguration.ProcedureGroup"/>
    <element v340="dConfiguration.06"                 v350="sConfiguration.02"/>
    <element v340="dConfiguration.03"                 v350="sConfiguration.03"/>
    <element v340="dConfiguration.MedicationGroup"    v350="sConfiguration.MedicationGroup"/>
    <element v340="dConfiguration.08"                 v350="sConfiguration.04"/>
    <element v340="dConfiguration.04"                 v350="sConfiguration.05"/>
    <element v340="dConfiguration.05"                 v350="sConfiguration.06"/>
    <element v340="dAgency"                           v350="sAgency"/>
    <element v340="dAgencyGroup"                      v350="sAgencyGroup"/>
    <element v340="dAgency.01"                        v350="sAgency.01"/>
    <element v340="dAgency.02"                        v350="sAgency.02"/>
    <element v340="dAgency.03"                        v350="sAgency.03"/>
    <element v340="dFacility"                         v350="sFacility"/>
    <element v340="dFacilityGroup"                    v350="sFacilityGroup"/>
    <element v340="dFacility.01"                      v350="sFacility.01"/>
    <element v340="dFacility.FacilityGroup"           v350="sFacility.FacilityGroup"/>
    <element v340="dFacility.02"                      v350="sFacility.02"/>
    <element v340="dFacility.03"                      v350="sFacility.03"/>
    <element v340="dFacility.04"                      v350="sFacility.04"/>
    <element v340="dFacility.05"                      v350="sFacility.05"/>
    <element v340="dFacility.06"                      v350="sFacility.06"/>
    <element v340="dFacility.07"                      v350="sFacility.07"/>
    <element v340="dFacility.08"                      v350="sFacility.08"/>
    <element v340="dFacility.09"                      v350="sFacility.09"/>
    <element v340="dFacility.10"                      v350="sFacility.10"/>
    <element v340="dFacility.11"                      v350="sFacility.11"/>
    <element v340="dFacility.12"                      v350="sFacility.12"/>
    <element v340="dFacility.13"                      v350="sFacility.13"/>
    <element v340="dFacility.14"                      v350="sFacility.14"/>
    <element v340="dFacility.15"                      v350="sFacility.15"/>
  </xsl:variable>

</xsl:stylesheet>
