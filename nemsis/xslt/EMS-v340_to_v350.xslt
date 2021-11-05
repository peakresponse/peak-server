<?xml version="1.0" encoding="UTF-8"?>

<!--

XML Stylesheet Language Transformation (XSLT) to transform NEMSIS EMSDataSet from v3.4.0 to v3.5.0

Version: 3.4.0.200910CP2_3.5.0.191130CP1_201106
Revision Date: November 6, 2020

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
    <xsl:attribute name="xsi:schemaLocation">http://www.nemsis.org http://www.nemsis.org/media/nemsis_v3/release-3.5.0/XSDs/NEMSIS_XSDs/EMSDataSet_v3.xsd</xsl:attribute>
  </xsl:template>

  <!-- eState: Remove -->
  <xsl:template match="n:eState"/>

  <!-- @CorrelationID, @CustomElementID, eCustomConfiguration.09, @ProcedureGroupCorrelationID, eCustomResults.02, eCustomResults.03: pad if length is less than 2 -->
  <xsl:template match="@CorrelationID[string-length(.) &lt; 2] |
                       @CustomElementID[string-length(.) &lt; 2] |
                       @ProcedureGroupCorrelationID[string-length(.) &lt; 2]">
    <xsl:attribute name="{local-name()}">
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="n:eCustomConfiguration.09[string-length(.) &lt; 2] |
                       n:eCustomResults.02[string-length(.) &lt; 2] |
                       n:eCustomResults.03[string-length(.) &lt; 2]">
    <xsl:copy>
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:copy>
  </xsl:template>

  <!-- eCustomConfiguration.02: pad if length is less than 2 -->
  <xsl:template match="n:eCustomConfiguration.02[string-length(.) &lt; 2]">
    <xsl:copy>
      <xsl:text>__</xsl:text>
      <xsl:value-of select="."/>
    </xsl:copy>
  </xsl:template>

  <!-- eCrew.02: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:eCrew.02[. = '9925013']">
    <xsl:copy>9925003</xsl:copy>
  </xsl:template>

  <!-- eCrew.02: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:eCrew.02[. = '9925015']">
    <xsl:copy>9925005</xsl:copy>
  </xsl:template>

  <!-- eCrew.02: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:eCrew.02[. = '9925017']">
    <xsl:copy>9925002</xsl:copy>
  </xsl:template>

  <!-- eCrew.02: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:eCrew.02[. = '9925019']">
    <xsl:copy>9925007</xsl:copy>
  </xsl:template>

  <!-- eResponse.07: Map to new codes using eResponse.15 -->
  <xsl:template match="n:eResponse.07[not(. = ('2207011', '2207013'))]">
    <xsl:copy>
      <xsl:choose>
        <!--  Ground Transport -->
        <xsl:when test=". = '2207003'">
          <xsl:choose>
            <!-- BLS... => Ground Transport (BLS Equipped) -->
            <xsl:when test="../n:eResponse.15 = ('2215001', '2215003', '2215005', '2215007', '2215023')">2207017</xsl:when>
            <!-- ALS... => Ground Transport (ALS Equipped) -->
            <xsl:when test="../n:eResponse.15 = ('2215009', '2215011', '2215013', '2215015', '2215017', '2215019')">2207015</xsl:when>
            <!-- Specialty Critical Care => Ground Transport (Critical Care Equipped) -->
            <xsl:when test="../n:eResponse.15 = '2215021'">2207019</xsl:when>
          </xsl:choose>
        </xsl:when>
        <!--  Non-Transport... -->
        <xsl:when test=". = ('2207005', '2207007', '2207009')">
          <xsl:choose>
            <!-- BLS... => Non-Transport-Medical Treatment (BLS Equipped) -->
            <xsl:when test="../n:eResponse.15 = ('2215001', '2215003', '2215005', '2215007', '2215023')">2207023</xsl:when>
            <!-- ALS..., Specialty Critical Care => Non-Transport-Medical Treatment (ALS Equipped) -->
            <xsl:when test="../n:eResponse.15 = ('2215009', '2215011', '2215013', '2215015', '2215017', '2215019', '2215021')">2207021</xsl:when>
          </xsl:choose>
        </xsl:when>
      </xsl:choose>
    </xsl:copy>
  </xsl:template>

  <!-- eResponse.15: Remove -->
  <xsl:template match="n:eResponse.15"/>

  <!-- ePayment.42: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:ePayment.42[. = '2642019']">
    <xsl:copy>2642011</xsl:copy>
  </xsl:template>

  <!-- ePayment.42: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:ePayment.42[. = '2642021']">
    <xsl:copy>2642013</xsl:copy>
  </xsl:template>

  <!-- ePayment.42: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:ePayment.42[. = '2642023']">
    <xsl:copy>2642014</xsl:copy>
  </xsl:template>

  <!-- ePayment.42: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:ePayment.42[. = '2642025']">
    <xsl:copy>2642017</xsl:copy>
  </xsl:template>

  <!-- eHistory.17: Map "Smell of Alcohol on Breath" to "Physical Exam Indicates Suspected Alcohol or Drug Use" -->
  <xsl:template match="n:eHistory.17[. = '3117011']">
    <xsl:copy>3117013</xsl:copy>
  </xsl:template>

  <!-- eHistory.17/@PN: Map "Refused" to "Unable to Complete" -->
  <xsl:template match="n:eHistory.17/@PN[. = '8801019']">
    <xsl:attribute name="PN">8801023</xsl:attribute>
  </xsl:template>

  <!-- eVitals.30: Map "Los Angeles" to "Los Angeles Prehospital Stroke Screen (LAPSS)" -->
  <xsl:template match="n:eVitals.30[. = '3330003']">
    <xsl:copy>3330004</xsl:copy>
  </xsl:template>

  <!-- eExam.19: Map "Pharmacologically Sedated/Paralyzed" to "Pharmacologically Sedated" -->
  <xsl:template match="n:eExam.19[. = '3519019']">
    <xsl:copy>3519037</xsl:copy>
  </xsl:template>

  <!-- eExam.20: Map "Seizures" to "Other Seizures" -->
  <xsl:template match="n:eExam.20[. = '3520025']">
    <xsl:copy>3520055</xsl:copy>
  </xsl:template>

  <!-- eSituation: Insert required elements if missing -->
  <xsl:template match="n:eSituation">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
      <!-- eSituation.18: Insert if missing -->
      <xsl:if test="not(n:eSituation.18)">
        <eSituation.18 xsi:nil="true" NV="7701001"/>
      </xsl:if>
      <!-- eSituation.20: Insert -->
      <eSituation.20 xsi:nil="true" NV="7701003"/>
    </xsl:copy>
  </xsl:template>

  <!-- eArrest.05: Remove -->
  <xsl:template match="n:eArrest.05"/>

  <!-- eArrest.06: Remove -->
  <xsl:template match="n:eArrest.06"/>

  <!-- eArrest.08: Remove -->
  <xsl:template match="n:eArrest.08"/>

  <!-- eArrest: Insert required elements -->
  <xsl:template match="n:eArrest">
    <xsl:copy>
      <xsl:apply-templates/>
      <eArrest.20 xsi:nil="true" NV="7701003"/>
      <eArrest.21 xsi:nil="true" NV="7701003"/>
      <eArrest.22 xsi:nil="true" NV="7701003"/>
    </xsl:copy>
  </xsl:template>

  <!-- eVitals.CardiacRhythmGroup/@CorrelationID: Remove -->
  <xsl:template match="n:eVitals.CardiacRhythmGroup/@CorrelationID"/>

  <!-- eVitals.16: Set @ETCO2Type to "mmHg" -->
  <xsl:template match="n:eVitals.16[. != '']">
    <xsl:copy>
      <xsl:attribute name="ETCO2Type">3340001</xsl:attribute>
      <xsl:value-of select="."/>
    </xsl:copy>
  </xsl:template>

  <!-- eVitals.18: Map "20" to "Low" -->
  <xsl:template match="n:eVitals.18[. = '20']">
    <xsl:copy>
      <xsl:apply-templates select ="@*"/>
      <xsl:text>Low</xsl:text>
    </xsl:copy>
  </xsl:template>

  <!-- eVitals.18: Map "600" to "High" -->
  <xsl:template match="n:eVitals.18[. = '600']">
    <xsl:copy>
      <xsl:apply-templates select ="@*"/>
      <xsl:text>High</xsl:text>
    </xsl:copy>
  </xsl:template>

  <!-- eExam.AssessmentGroup: Map eExam.08 to eExam.LungGroup and eExam.ChestGroup -->
  <xsl:template match="n:eExam.AssessmentGroup[n:eExam.08]">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="n:eExam.03"/>
      <xsl:apply-templates select="n:eExam.04"/>
      <xsl:apply-templates select="n:eExam.05"/>
      <xsl:apply-templates select="n:eExam.06"/>
      <xsl:apply-templates select="n:eExam.07"/>
      <xsl:apply-templates select="n:eExam.09"/>
      <xsl:apply-templates select="n:eExam.AbdomenGroup"/>
      <xsl:apply-templates select="n:eExam.12"/>
      <xsl:apply-templates select="n:eExam.SpineGroup"/>
      <xsl:apply-templates select="n:eExam.ExtremityGroup"/>
      <xsl:apply-templates select="n:eExam.EyeGroup"/>
      <!-- eExam.08: Map to eExam.LungGroup -->
      <xsl:apply-templates select="n:eExam.08" mode="eExam.LungGroup"/>
      <!-- eExam.08: Map to eExam.ChestGroup -->
      <xsl:apply-templates select="n:eExam.08" mode="eExam.ChestGroup"/>
      <xsl:apply-templates select="n:eExam.19"/>
      <xsl:apply-templates select="n:eExam.20"/>
    </xsl:copy>
  </xsl:template>

  <!-- eExam.08 => eExam.LungGroup -->
  <xsl:template match="n:eExam.08" mode="eExam.LungGroup">
    <xsl:choose>
      <!-- Breath Sounds-Absent-Left => Left / Breath Sounds-Absent -->
      <xsl:when test=". = '3508011'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523001'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Breath Sounds-Absent-Right => Right / Breath Sounds-Absent -->
      <xsl:when test=". = '3508013'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523001'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Breath Sounds-Decreased Left => Left / Breath Sounds-Decreased -->
      <xsl:when test=". = '3508015'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523003'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Breath Sounds-Decreased Right => Right / Breath Sounds-Decreased -->
      <xsl:when test=". = '3508017'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523003'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Breath Sounds-Equal => Bilateral / Breath Sounds-Equal-->
      <xsl:when test=". = '3508019'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522005'"/>
          <xsl:with-param name="assessment" select="'3523005'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Breath Sounds-Normal-Left => Left / Breath Sounds-Normal -->
      <xsl:when test=". = '3508021'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523007'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Breath Sounds-Normal-Right => Right / Breath Sounds-Normal -->
      <xsl:when test=". = '3508023'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523007'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Foreign Body -->
      <xsl:when test=". = '3508041'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3523009'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Increased Respiratory Effort -->
      <xsl:when test=". = '3508047'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3523011'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Normal -->
      <xsl:when test=". = '3508053'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3523013'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Not Done -->
      <xsl:when test=". = '3508055'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3523015'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Pain -->
      <xsl:when test=". = '3508057'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3523017'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Pain with Inspiration/expiration - Left => Left / Pain with Inspiration/Expiration -->
      <xsl:when test=". = '3508059'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523019'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Pain with Inspiration/expiration - Right => Right / Pain with Inspiration/Expiration -->
      <xsl:when test=". = '3508061'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523019'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Rales - Left => Left / Rales-->
      <xsl:when test=". = '3508065'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523021'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Rales - Right => Right / Rales -->
      <xsl:when test=". = '3508067'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523021'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Rhonchi - Left => Left / Rhonchi-->
      <xsl:when test=". = '3508071'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523023'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Rhonchi - Right => Right / Rhonchi -->
      <xsl:when test=". = '3508073'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523023'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Rhonchi/Wheezing -->
      <xsl:when test=". = '3508075'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3523025'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Stridor - Left => Left / Stridor-->
      <xsl:when test=". = '3508077'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523027'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Stridor - Right => Right / Stridor -->
      <xsl:when test=". = '3508079'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523027'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Wheezing-Expiratory - Left => Left / Wheezing-Expiratory-->
      <xsl:when test=". = '3508089'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523029'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Wheezing-Expiratory - Right => Right / Wheezing-Expiratory -->
      <xsl:when test=". = '3508091'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523029'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Wheezing-Inspiratory - Left => Left / Wheezing-Inspiratory-->
      <xsl:when test=". = '3508093'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522001'"/>
          <xsl:with-param name="assessment" select="'3523031'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Wheezing-Inspiratory - Right => Right / Wheezing-Inspiratory -->
      <xsl:when test=". = '3508095'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3522003'"/>
          <xsl:with-param name="assessment" select="'3523031'"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <!-- eExam.08 => eExam.ChestGroup -->
  <xsl:template match="n:eExam.08" mode="eExam.ChestGroup">
    <xsl:choose>
      <!-- Abrasion -->
      <xsl:when test=". = '3508001'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525001'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Avulsion -->
      <xsl:when test=". = '3508003'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525003'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Accessory Muscles Used with Breathing -->
      <xsl:when test=". = '3508005'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525005'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Bleeding Controlled -->
      <xsl:when test=". = '3508007'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525007'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Bleeding Uncontrolled -->
      <xsl:when test=". = '3508009'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525009'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Burn-Blistering -->
      <xsl:when test=". = '3508025'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525011'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Burn-Charring -->
      <xsl:when test=". = '3508027'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525013'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Burn-Redness -->
      <xsl:when test=". = '3508029'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525015'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Burn-White/Waxy -->
      <xsl:when test=". = '3508031'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525017'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Crush Injury -->
      <xsl:when test=". = '3508033'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525019'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Deformity -->
      <xsl:when test=". = '3508035'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525021'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Flail Segment-Left => Left - Anterior / Flail Segment -->
      <xsl:when test=". = '3508037'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3524001'"/>
          <xsl:with-param name="assessment" select="'3525023'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Flail Segment-Right => Right - Anterior / Flail Segment -->
      <xsl:when test=". = '3508039'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3524005'"/>
          <xsl:with-param name="assessment" select="'3525023'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Implanted Device -->
      <xsl:when test=". = '3508049'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525025'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Laceration -->
      <xsl:when test=". = '3508051'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525027'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Normal -->
      <xsl:when test=". = '3508053'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525029'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Not Done -->
      <xsl:when test=". = '3508055'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525031'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Pain -->
      <xsl:when test=". = '3508057'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525033'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Pain with Inspiration/expiration-Left => Left - Side / Pain with Inspiration/Expiration -->
      <xsl:when test=". = '3508059'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3524013'"/>
          <xsl:with-param name="assessment" select="'3525035'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Pain with Inspiration/expiration-Right => Right - Side / Pain with Inspiration/Expiration -->
      <xsl:when test=". = '3508061'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3524015'"/>
          <xsl:with-param name="assessment" select="'3525035'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Puncture/Stab Wound -->
      <xsl:when test=". = '3508063'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525037'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Retraction -->
      <xsl:when test=". = '3508069'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525039'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Tenderness-Left => Left - Side / Tenderness-->
      <xsl:when test=". = '3508085'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3524013'"/>
          <xsl:with-param name="assessment" select="'3525041'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Tenderness-Right => Right - Side / Tenderness-->
      <xsl:when test=". = '3508087'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="location" select="'3524015'"/>
          <xsl:with-param name="assessment" select="'3525041'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Gunshot Wound -->
      <xsl:when test=". = '3508097'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525043'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Swelling -->
      <xsl:when test=". = '3508099'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525045'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Contusion -->
      <xsl:when test=". = '3508101'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525047'"/>
        </xsl:call-template>
      </xsl:when>
      <!-- Tenderness -->
      <xsl:when test=". = '3508103'">
        <xsl:call-template name="eExamLungGroupChestGroup">
          <xsl:with-param name="assessment" select="'3525049'"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <!--Named template to generate  eExam.LungGroup or eExam.ChestGroup instances from eExam.08 instances -->
  <!-- $location (optional) should be the value for eExam.22 or eExam.24 -->
  <!-- $assessment should be the value for eExam.23 or eExam.25 -->
  <xsl:template name="eExamLungGroupChestGroup">
    <xsl:param name="location"/>
    <xsl:param name="assessment" required="yes"/>
    <xsl:variable name="lungChest">
      <xsl:choose>
        <xsl:when test="substring($assessment, 3, 2) = '23'">eExam.LungGroup</xsl:when>
        <xsl:when test="substring($assessment, 3, 2) = '25'">eExam.ChestGroup</xsl:when>
      </xsl:choose>
    </xsl:variable>
    <xsl:element name="{$lungChest}">
      <!-- For values that map to both eExam.LungGroup and eExam.ChestGroup (Normal, Not Done, Pain, Pain with Inspiration/expiration - Left, Pain with Inspiration/expiration - Right), copy @CorrelationID to eExam.LungGroup only -->
      <xsl:if test="not($lungChest = 'eExam.ChestGroup' and $assessment = ('3508053', '3508055', '3508057', '3508059', '3508061'))">
        <xsl:apply-templates select="@CorrelationID"/>
      </xsl:if>
      <xsl:if test="$location">
        <xsl:element name="{concat('eExam.', substring($location, 3, 2))}">
          <xsl:value-of select="$location"/>
        </xsl:element>
      </xsl:if>
      <xsl:element name="{concat('eExam.', substring($assessment, 3, 2))}">
        <xsl:apply-templates select="@PN"/>
        <xsl:value-of select="$assessment"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <!-- eMedications.03: Set @CodeType to "RxNorm" if not empty -->
  <xsl:template match="n:eMedications.03[. != '']">
    <xsl:copy>
      <xsl:attribute name="CodeType">9924003</xsl:attribute>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- eMedications.04: Insert if missing -->
  <xsl:template match="n:eMedications.DosageGroup[not(preceding-sibling::n:eMedications.04)]">
    <eMedications.04 xsi:nil="true" NV="7701003"/>
    <xsl:copy>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <!-- eMedications.06: Map "Liters Per Minute (l/min [fluid])" to "Liters Per Minute (LPM [gas])" -->
  <xsl:template match="n:eMedications.06[. = '3706011']">
    <xsl:copy>3706035</xsl:copy>
  </xsl:template>

  <!-- eMedications.10, eProcedures.10: Map "EMT-Basic" to "Emergency Medical Technician (EMT)" -->
  <xsl:template match="n:eMedications.10[. = '9905009'] | 
                       n:eProcedures.10[. = '9905009']">
    <xsl:copy>9905005</xsl:copy>
  </xsl:template>

  <!-- eMedications.10, eProcedures.10: Map "EMT-Intermediate" to "Emergency Medical Technician - Intermediate" -->
  <xsl:template match="n:eMedications.10[. = '9905011'] | 
                       n:eProcedures.10[. = '9905011']">
    <xsl:copy>9905002</xsl:copy>
  </xsl:template>

  <!-- eMedications.10, eProcedures.10: Map "EMT-Paramedic" to "Paramedic" -->
  <xsl:template match="n:eMedications.10[. = '9905013'] | 
                       n:eProcedures.10[. = '9905013']">
    <xsl:copy>9905007</xsl:copy>
  </xsl:template>

  <!-- eMedications.10, eProcedures.10: Map "First Responder" to "Emergency Medical Responder (EMR)" -->
  <xsl:template match="n:eMedications.10[. = '9905015'] | 
                       n:eProcedures.10[. = '9905015']">
    <xsl:copy>9905003</xsl:copy>
  </xsl:template>

  <!-- eMedications.10, eProcedures.10: Map "Patient/Lay Person" to "Lay Person" -->
  <xsl:template match="n:eMedications.10[. = '9905023'] | 
                       n:eProcedures.10[. = '9905023']">
    <xsl:copy>9905045</xsl:copy>
  </xsl:template>

  <!-- eDisposition.12: Map to eDisposition.IncidentDispositionGroup -->
  <xsl:template match="n:eDisposition.12">
    <eDisposition.IncidentDispositionGroup>
      <eDisposition.27>
        <xsl:choose>
          <!-- Assist..., Canceled On Scene (No Patient Contact) => No Patient Contact -->
          <xsl:when test=". = ('4212001', '4212003', '4212005', '4212009')">4227007</xsl:when>
          <!-- Canceled (Prior to Arrival At Scene) => Cancelled Prior to Arrival at Scene -->
          <xsl:when test=". = '4212007'">4227005</xsl:when>
          <!-- Canceled on Scene (No Patient Found) => No Patient Found -->
          <xsl:when test=". = '4212011'">4227009</xsl:when>
          <!-- Standby..., Transport Non-Patient, Organs, etc. => Non-Patient Incident (Not Otherwise Listed) -->
          <xsl:when test=". = ('4212039', '4212041', '4212043')">4227011</xsl:when>
          <!-- Otherwise: Patient... => Patient Contact Made -->
          <xsl:otherwise>4227001</xsl:otherwise>
        </xsl:choose>
      </eDisposition.27>
      <eDisposition.28>
        <xsl:choose>
          <!-- Assist..., Canceled..., Standby..., Transport Non-Patient, Organs, etc. => Not Applicable -->
          <xsl:when test=". = ('4212001', '4212003', '4212005', '4212007', '4212009', '4212011', '4212039', '4212041', '4212043')">
            <xsl:attribute name="xsi:nil">true</xsl:attribute>
            <xsl:attribute name="NV">7701001</xsl:attribute>
          </xsl:when>
          <!-- Patient Dead at Scene-No Resuscitation Attempted..., Patient Evaluated, No Treatment/Transport Required => Patient Evaluated, No Care Required -->
          <xsl:when test=". = ('4212013', '4212015', '4212021')">4228005</xsl:when>
          <!-- Patient Refused Evaluation/Care... => Patient Refused Evaluation/Care-->
          <xsl:when test=". = ('4212023', '4212025')">4228007</xsl:when>
          <!-- Otherwise: Patient Dead at Scene-Resuscitation Attempted..., Patient Treated... => Patient Evaluated and Care Provided -->
          <xsl:otherwise>4228001</xsl:otherwise>
        </xsl:choose>
      </eDisposition.28>
      <eDisposition.29>
        <xsl:choose>
          <!-- Assist..., Patient Dead at Scene-No Resuscitation Attempted (With Transport), Standby-Public Safety, Fire, or EMS Operational Support Provided, Transport Non-Patient, Organs, etc. => Incident Support Services Provided (Including Standby) -->
          <xsl:when test=". = ('4212001', '4212003', '4212005', '4212013', '4212041', '4212043')">4229009</xsl:when>
          <!-- Patient Refused Evaluation/Care... => Patient Refused Evaluation/Care -->
          <xsl:when test=". = ('4212007', '4212009', '4212011', '4212015', '4212021', '4212039')">4229011</xsl:when>
          <!-- Patient Refused Evaluation/Care (With Transport), Patient Refused Evaluation/Care (Without Transport) => Back in Service, Care/Support Services Refused -->
          <xsl:when test=". = ('4212023','4212025')">4229013</xsl:when>
          <!-- Patient Treated, Transferred Care to Another EMS Unit => Initiated Primary Care and Transferred to Another EMS Crew -->
          <xsl:when test=". = '4212031'">4229003</xsl:when>
          <!-- Otherwise: Patient Dead at Scene-Resuscitation Attempted..., Patient Treated, Released..., Patient Treated, Transported... => Initiated and Continued Primary Care -->
          <xsl:otherwise>4229001</xsl:otherwise>
        </xsl:choose>
      </eDisposition.29>
      <eDisposition.30>
        <xsl:choose>
          <!-- ...(With Transport),  Patient Treated, Transported by this EMS Unit => Transport by This EMS Unit (This Crew Only) -->
          <xsl:when test=". = ('4212013', '4212017', '4212023', '4212033')">4230001</xsl:when>
          <!-- Patient Treated, Released (AMA) => Patient Refused Transport -->
          <xsl:when test=". = '4212027'">4230009</xsl:when>
          <!-- Patient Treated, Transferred Care to Another EMS Unit => Transport by Another EMS Unit -->
          <xsl:when test=". = '4212031'">4230005</xsl:when>
          <!-- Standby... => Not Applicable -->
          <xsl:when test=". = ('4212039', '4212041')">
            <xsl:attribute name="xsi:nil">true</xsl:attribute>
            <xsl:attribute name="NV">7701001</xsl:attribute>
          </xsl:when>
          <!-- Transport Non-Patient, Organs, etc. => Non-Patient Transport (Not Otherwise Listed) -->
          <xsl:when test=". = '4212043'">4230011</xsl:when>
          <!-- Otherwise: Assist..., Canceled..., ...Without Transport, Patient Treated, Released (per protocol), Patient Treated, Transported by Law Enforcement, Patient Treated, Transported by Private Vehicle => No Transport -->
          <xsl:otherwise>4230013</xsl:otherwise>
        </xsl:choose>
      </eDisposition.30>
      <xsl:choose>
        <!-- Patient Evaluated, No Treatment/Transport Required => Released Following Protocol Guidelines -->
        <xsl:when test=". = ('4212021', '4212029')">
          <eDisposition.31>4231005</eDisposition.31>
        </xsl:when>
        <!-- Patient Treated, Released (AMA) => Against Medical Advice -->
        <xsl:when test=". = '4212027'">
          <eDisposition.31>4231001</eDisposition.31>
        </xsl:when>
        <!-- Patient Treated, Transported by Law Enforcement => Released to Law Enforcement -->
        <xsl:when test=". = '4212035'">
          <eDisposition.31>4231007</eDisposition.31>
        </xsl:when>
      </xsl:choose>
    </eDisposition.IncidentDispositionGroup>
  </xsl:template>

  <!-- eDisposition.21: Map "Nursing Home/Assisted Living Facility" to "Assisted Living Facility" -->
  <xsl:template match="n:eDisposition.21[. = '4221011']">
    <xsl:copy>4221029</xsl:copy>
  </xsl:template>

  <!-- eDisposition.23: Map "Stroke Center" to "Not Recorded" -->
  <xsl:template match="n:eDisposition.23[. = '9908017']">
    <xsl:copy use-attribute-sets="NotRecorded"/>
  </xsl:template>

  <!-- eDisposition.32: Map to new mandatory element from eDisposition.12, eProcedures.ProcedureGroup, eResponse.15 -->
  <xsl:template match="n:eDisposition/*[position() = last()]">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
    <eDisposition.32>
      <xsl:choose>
        <!-- eDisposition.12: Assist..., Cancelled..., Patient Dead at Scene-No Resuscitation Attempted..., Patient Evaluated, No Treatment/Transport Required, Patient Refused..., Standby..., Transport Non-Patient, Oregans, etc. => No Care Provided -->
        <xsl:when test="../n:eDisposition.12 = ('4212001', '4212003', '4212005', '4212007', '4212009', '4212011', '4212039', '4212041', '4212043')">4232001</xsl:when>
        <!-- No non-empty eProcedure.ProcedureGroup and eDisposition.12: Patient Dead at Scene-No Resuscitation Attempted..., Patient Evaluated, No Treatment/Transport Required, Patient Refused... -->
        <xsl:when test="not(../../n:eProcedures/n:eProcedures.ProcedureGroup[.//* != '']) and ../n:eDisposition.12 = ('4212013', '4212015', '4212021', '4212023', '4212025')">4232001</xsl:when>
        <!-- eResponse.15: BLS-... (except BLS-Community Paramedicine) => BLS - All Levels -->
        <xsl:when test="../../n:eResponse/n:eResponse.15 = ('2215001', '2215003', '2215005', '2215007')">4232001</xsl:when>
        <!-- eResponse.15: ALS-AEMT, ALS-Intermediate => ALS - AEMT/Intermediate -->
        <xsl:when test="../../n:eResponse/n:eResponse.15 = ('2215009', '2215011')">4232003</xsl:when>
        <!-- eResponse.15: ALS-Paramedic => ALS - Paramedic -->
        <xsl:when test="../../n:eResponse/n:eResponse.15 = '2215013'">4232005</xsl:when>
        <!-- eResponse.15: ALS-Nurse, ALS-Physician => EMS and Other Health-Care Staff -->
        <xsl:when test="../../n:eResponse/n:eResponse.15 = ('2215017', '2215019')">4232007</xsl:when>
        <!-- eResponse.15: Specialty Critical Care => Critical Care -->
        <xsl:when test="../../n:eResponse/n:eResponse.15 = '2215021'">4232009</xsl:when>
        <!-- eResponse.15: BLS-Community Paramedicine, ALS-Community Paramedicine => Integrated Healthcare -->
        <xsl:when test="../../n:eResponse/n:eResponse.15 = ('2215023', '2215015')">4232011</xsl:when>
      </xsl:choose>
    </eDisposition.32>
  </xsl:template>

  <!-- eOutcome: Insert required children if missing, remove retired elements -->
  <xsl:template match="n:eOutcome">
    <xsl:copy>
      <xsl:apply-templates select="n:eOutcome.01"/>
      <xsl:apply-templates select="n:eOutcome.02"/>
      <xsl:apply-templates select="n:eOutcome.ExternalDataGroup"/>
      <!-- eOutcome.06: Remove -->
      <!-- eOutcome.07: Remove -->
      <!-- eOutcome.08: Remove -->
      <xsl:choose>
        <xsl:when test="n:eOutcome.09">
          <xsl:apply-templates select="n:eOutcome.09"/>
        </xsl:when>
        <xsl:otherwise>
          <eOutcome.EmergencyDepartmentProceduresGroup>
            <eOutcome.09 xsi:nil="true" NV="7701003"/>
            <eOutcome.19 xsi:nil="true" NV="7701003"/>
          </eOutcome.EmergencyDepartmentProceduresGroup>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eOutcome.10">
          <xsl:apply-templates select="n:eOutcome.10"/>
        </xsl:when>
        <xsl:otherwise>
          <eOutcome.10 xsi:nil="true" NV="7701003"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eOutcome.11">
          <xsl:apply-templates select="n:eOutcome.11"/>
        </xsl:when>
        <xsl:otherwise>
          <eOutcome.11 xsi:nil="true" NV="7701003"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eOutcome.12">
          <xsl:apply-templates select="n:eOutcome.12"/>
        </xsl:when>
        <xsl:otherwise>
          <eOutcome.HospitalProceduresGroup>
            <eOutcome.12 xsi:nil="true" NV="7701003"/>
            <eOutcome.20 xsi:nil="true" NV="7701003"/>
          </eOutcome.HospitalProceduresGroup>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="n:eOutcome.13">
          <xsl:apply-templates select="n:eOutcome.13"/>
        </xsl:when>
        <xsl:otherwise>
          <eOutcome.13 xsi:nil="true" NV="7701003"/>
        </xsl:otherwise>
      </xsl:choose>
      <!-- eOutcome.14: Remove -->
      <!-- eOutcome.15: Remove -->
      <xsl:choose>
        <xsl:when test="n:eOutcome.16">
          <xsl:apply-templates select="n:eOutcome.16"/>
        </xsl:when>
        <xsl:otherwise>
          <eOutcome.16 xsi:nil="true" NV="7701003"/>
        </xsl:otherwise>
      </xsl:choose>
      <!-- eOutcome.17: Remove -->
      <!-- eOutcome.18: Insert required element -->
      <eOutcome.18 xsi:nil="true" NV="7701003"/>
    </xsl:copy>
  </xsl:template>

  <!-- eOutcome.09: Enclose in eOutcome.EmergencyDepartmentProceduresGroup -->
  <xsl:template match="n:eOutcome.09">
    <eOutcome.EmergencyDepartmentProceduresGroup>
      <xsl:apply-templates select="@CorrelationID"/>
      <xsl:copy>
        <xsl:value-of select="."/>
      </xsl:copy>
      <eOutcome.19 xsi:nil="true" NV="7701003"/>
    </eOutcome.EmergencyDepartmentProceduresGroup>
  </xsl:template>

  <!-- eOutcome.12: Enclose in eOutcome.HospitalProceduresGroup -->
  <xsl:template match="n:eOutcome.12">
    <eOutcome.HospitalProceduresGroup>
      <xsl:apply-templates select="@CorrelationID"/>
      <xsl:copy>
        <xsl:value-of select="."/>
      </xsl:copy>
      <eOutcome.20 xsi:nil="true" NV="7701003"/>
    </eOutcome.HospitalProceduresGroup>
  </xsl:template>

  <!-- eOther.09: Map "DNR/Living Will" to "DNR" -->
  <xsl:template match="n:eOther.09[. = '4509007']">
    <xsl:copy>4509006</xsl:copy>
  </xsl:template>

  <!-- eOther.15: Map "Refused" to "Not Signed - Refused" -->
  <xsl:template match="n:eOther.15[. = '4515029']">
    <xsl:copy>4515019</xsl:copy>
  </xsl:template>

</xsl:stylesheet>
