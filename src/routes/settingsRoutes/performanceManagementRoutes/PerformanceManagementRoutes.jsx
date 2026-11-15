import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

const questionLabels = [
  "Quality of work",
  "Reliability",
  "Ownership",
  "Communication",
  "Team collaboration",
  "Adaptability",
  "Problem solving",
  "Goal achievement",
  "Professional conduct",
  "Continuous learning",
];
const blankQuestions = () =>
  questionLabels.map((_, i) => ({ id: i + 1, text: "" }));
// const defaults = {
//   schedule_type: 2,
//   activation_offset_days: -5,
//   cap_type: 1,
//   company_cap_percent: 10,
//   band_caps: [],
//   self_template_id: "",
//   reviewer_template_mode: 2,
//   shared_reviewer_template_id: "",
//   role_templates: [],
// };

const defaults = {
  schedule_type: "",
  activation_offset_days: "",
  cap_type: "",
  company_cap_percent: "",
  band_caps: [],
  self_template_id: "",
  reviewer_template_mode: "",
  //   shared_reviewer_template_id: "",
  role_templates: [],
};

// const controlStyles = {
//   h: "42px",
//   borderColor: "#D9DEE7",
//   fontFamily: "Poppins, sans-serif",
//   borderRadius: "5px",
//   bg: "white",
//   fontSize: "14px",
//   color: "#000",
//   _placeholder: { color: "#929BAA", fontSize: "14px" },
//   _focusVisible: { borderColor: "#1C385F", boxShadow: "0 0 0 1px #1C385F" },
// };

const controlStyles = {
  h: "42px",
  borderColor: "#D9DEE7",
  fontFamily: "poppins, 'sans-serif'",
  lineHeight: 1.2,
  letterSpacing: "-0.04em",
  fontWeight: 400,
  borderRadius: "5px",
  bg: "white",
  fontSize: "14px",
  color: "#4B4A4A8C",
  _placeholder: {
    fontFamily: "poppins, 'sans-serif'",
    lineHeight: 1.2,
    letterSpacing: "-0.04em",
    fontWeight: 400,
    borderRadius: "5px",
    bg: "white",
    fontSize: "14px",
    color: "#4B4A4A8C !important",
  },
  _focusVisible: { borderColor: "#1C385F", boxShadow: "0 0 0 1px #1C385F" },
};

const navyButton = {
  bg: "#274167",
  px: "14px",
  height: "auto",
  py: "12px",
  color: "white",
  size: "sm",
  px: 5,
  borderRadius: "10px",
  border: "1px solid #FFFFFF1A",
  _hover: { bg: "#142B4B" },
};

export default function PerformanceManagementRoutes() {
  const toast = useToast();
  const [settings, setSettings] = useState(defaults);
  const [bands, setBands] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  // The dropdown selects a template context; the actual saved template ID stays separate.
  const [selection, setSelection] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateQuestions, setTemplateQuestions] = useState(blankQuestions);

  const isObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));
  const hasSelfTemplate =
    isObjectId(settings.self_template_id) &&
    templates.some(
      (t) => t._id === settings.self_template_id && Number(t.type) === 1,
    );
  const validPositionMappings = settings.role_templates.filter(
    (item) =>
      isObjectId(item.position_id) &&
      isObjectId(item.template_id) &&
      jobTitles.some((p) => p._id === item.position_id) &&
      templates.some((t) => t._id === item.template_id && Number(t.type) === 2),
  );

  //   const hasReviewerTemplate =
  //     Number(settings.reviewer_template_mode) === 1
  //       ? isObjectId(settings.shared_reviewer_template_id) &&
  //         templates.some(
  //           (t) =>
  //             t._id === settings.shared_reviewer_template_id &&
  //             Number(t.type) === 2,
  //         )
  //       : validPositionMappings.length > 0;

  const hasReviewerTemplate =
    Number(settings.reviewer_template_mode) === 1
      ? hasSelfTemplate
      : Number(settings.reviewer_template_mode) === 2
        ? validPositionMappings.length > 0
        : false;

  const hasValidCap =
    Number(settings.cap_type) === 1
      ? settings.company_cap_percent !== "" &&
        Number.isFinite(Number(settings.company_cap_percent)) &&
        Number(settings.company_cap_percent) >= 0 &&
        Number(settings.company_cap_percent) <= 100
      : bands.length > 0 &&
        bands.every((band) => {
          const cap = settings.band_caps.find(
            (item) => item.band_id === band._id,
          )?.cap_percent;
          return (
            cap !== "" &&
            cap != null &&
            Number.isFinite(Number(cap)) &&
            Number(cap) >= 0 &&
            Number(cap) <= 100
          );
        });
  //   const canSaveSettings =
  //     hasSelfTemplate &&
  //     hasReviewerTemplate &&
  //     hasValidCap &&
  //     [1, 2].includes(Number(settings.schedule_type)) &&
  //     Number.isInteger(Number(settings.activation_offset_days));

  const canSaveSettings =
    hasSelfTemplate &&
    hasReviewerTemplate &&
    hasValidCap &&
    [1, 2].includes(Number(settings.schedule_type)) &&
    [1, 2].includes(Number(settings.cap_type)) &&
    [1, 2].includes(Number(settings.reviewer_template_mode)) &&
    settings.activation_offset_days !== "" &&
    Number.isInteger(Number(settings.activation_offset_days));

  const notifyError = (title, error) =>
    toast({
      title,
      description:
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      status: "error",
      duration: 4000,
      isClosable: true,
    });

  const fetchAllTemplates = async () => {
    const allTemplates = [];
    let page = 1;

    while (true) {
      const response = await api.get("/performance/get_templates", {
        params: { page, limit: 100 },
      });

      const batch = Array.isArray(response?.data?.result)
        ? response.data.result
        : [];

      allTemplates.push(...batch);

      if (batch.length < 100) break;

      page += 1;
    }

    return allTemplates;
  };

  const refreshTemplates = async () => {
    const list = await fetchAllTemplates();
    setTemplates(list);
    return list;
  };

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const orgId = getOrgCode();
        if (!orgId) throw new Error("Organization ID not available");
        const [bandsRes, positionsRes, templatesRes, settingsRes] =
          await Promise.all([
            api.get("/settings/get_bands", { params: { org_id: orgId } }),
            api.get("/settings/get_job_titles", { params: { org_id: orgId } }),
            // api.get("/performance/get_templates"),
            fetchAllTemplates(),
            api.get("/performance/get_settings"),
          ]);
        if (cancelled) return;
        setBands(
          (Array.isArray(bandsRes?.data?.data)
            ? bandsRes.data.data
            : []
          ).filter((b) => b.is_active),
        );
        setJobTitles(
          (Array.isArray(positionsRes?.data?.data)
            ? positionsRes.data.data
            : []
          ).filter((p) => p.is_active),
        );
        // setTemplates(
        //   Array.isArray(templatesRes?.data?.result)
        //     ? templatesRes.data.result
        //     : [],
        // );
        setTemplates(templatesRes);
        const saved = settingsRes?.data?.result;
        if (saved)
          setSettings({
            ...defaults,
            ...saved,
            band_caps: Array.isArray(saved.band_caps) ? saved.band_caps : [],
            role_templates: Array.isArray(saved.role_templates)
              ? saved.role_templates
              : [],
            self_template_id: saved.self_template_id || "",
            // shared_reviewer_template_id:
            //   saved.shared_reviewer_template_id || "",
          });
      } catch (error) {
        if (!cancelled)
          notifyError("Failed to load performance settings", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetting = (field) => (event) => {
    const value = event.target.value;
    setSettings((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));
  };

  const updateBandCap = (bandId, value) =>
    setSettings((prev) => ({
      ...prev,
      band_caps: [
        ...prev.band_caps.filter((b) => b.band_id !== bandId),
        { band_id: bandId, cap_percent: value },
      ],
    }));

  const mappingForPosition = (positionId) =>
    settings.role_templates.find(
      (item) => (item.position_id || item.role_id) === positionId,
    );

  const findExistingTemplate = (context) => {
    if (!context) return null;

    let name = "";
    let type = 2;
    let assignedId = "";

    if (context === "self") {
      name = "Self-assessment";
      type = 1;
      assignedId = settings.self_template_id;
    } else if (context.startsWith("position:")) {
      const positionId = context.slice(9);

      name =
        jobTitles.find((item) => item._id === positionId)?.position_name || "";

      assignedId = mappingForPosition(positionId)?.template_id || "";
    }

    // const assigned = templates.find(
    //   (item) =>
    //     item._id === assignedId &&
    //     Number(item.type) === type &&
    //     item.name === name,
    // );
    const assigned = templates.find(
      (item) => item._id === assignedId && Number(item.type) === type,
    );

    if (assigned) return assigned;

    // Otherwise find the existing template by name and type.
    const matches = templates.filter(
      (item) => item.name === name && Number(item.type) === type,
    );

    return matches.length === 1 ? matches[0] : null;
  };

  //   const chooseTemplate = (event) => {
  //     const next = event.target.value;

  //     setSelection(next);

  //     const existing = findExistingTemplate(next);

  //     setSelectedTemplateId(existing?._id || "");

  //     setTemplateQuestions(
  //       questionLabels.map((_, index) => ({
  //         id: index + 1,
  //         text:
  //           existing?.questions?.find((q) => Number(q.id) === index + 1)?.text ||
  //           "",
  //       })),
  //     );
  //   };

  const chooseTemplate = (event) => {
    const next = event.target.value;

    setSelection(next);

    if (next.startsWith("position:")) {
      setSettings((prev) => ({
        ...prev,
        reviewer_template_mode: 2,
      }));
    }

    const existing = findExistingTemplate(next);

    setSelectedTemplateId(existing?._id || "");

    if (existing?._id) {
      setSettings((prev) => {
        if (next === "self") {
          return {
            ...prev,
            self_template_id: existing._id,
          };
        }

        if (next.startsWith("position:")) {
          const positionId = next.slice(9);

          return {
            ...prev,
            role_templates: [
              ...prev.role_templates.filter(
                (item) => (item.position_id || item.role_id) !== positionId,
              ),
              {
                position_id: positionId,
                template_id: existing._id,
              },
            ],
          };
        }

        return prev;
      });
    }

    // setTemplateQuestions(
    //   questionLabels.map((_, index) => ({
    //     id: index + 1,
    //     text:
    //       existing?.questions?.find((q) => Number(q.id) === index + 1)?.text ||
    //       "",
    //   })),
    // );
    setTemplateQuestions(
      questionLabels.map((_, index) => ({
        id: existing?.questions?.[index]?.id ?? index + 1,
        text: existing?.questions?.[index]?.text || "",
      })),
    );
  };

  const existingSelectedTemplate = selection
    ? findExistingTemplate(selection)
    : null;

  const handleQuestionChange = (id, text) =>
    setTemplateQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, text } : question,
      ),
    );

  const handleSaveTemplate = async () => {
    if (!selection) {
      toast({
        title: "Select a template category or position",
        status: "error",
        duration: 3000,
      });
      return;
    }
    const positionId = selection.startsWith("position:")
      ? selection.slice(9)
      : "";
    const position = jobTitles.find((item) => item._id === positionId);
    if (positionId && !position) return;

    // const payload = {
    //   name:
    //     selection === "self"
    //       ? "Self-assessment"
    //       : selection === "shared"
    //         ? "Shared reviewer"
    //         : position.position_name,
    //   type: selection === "self" ? 1 : 2,
    //   questions: templateQuestions.map((q) => ({
    //     id: Number(q.id),
    //     text: q.text.trim(),
    //   })),
    // };
    const payload = {
      name: selection === "self" ? "Self-assessment" : position.position_name,
      type: selection === "self" ? 1 : 2,
      questions: templateQuestions.map((q) => ({
        id: Number(q.id),
        text: q.text.trim(),
      })),
    };
    if (
      payload.questions.length !== 10 ||
      payload.questions.some((q) => !q.text)
    ) {
      toast({
        title: "All ten questions are required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setSavingTemplate(true);
    try {
      //   const response = selectedTemplateId
      //     ? await api.put(
      //         `/performance/update_template/${encodeURIComponent(selectedTemplateId)}`,
      //         payload,
      //       )
      //     : await api.post("/performance/create_template", payload);
      //   const savedId = response?.data?.result?._id || selectedTemplateId;
      const existing = findExistingTemplate(selection);

      const matchingTemplates = templates.filter(
        (item) =>
          item.name === payload.name && Number(item.type) === payload.type,
      );

      if (!existing && matchingTemplates.length > 1) {
        throw new Error("Multiple templates exist for this category.");
      }

      const templateId = existing?._id || selectedTemplateId;

      const response = templateId
        ? await api.put(
            `/performance/update_template/${encodeURIComponent(templateId)}`,
            payload,
          )
        : await api.post("/performance/create_template", payload);

      const savedId = response?.data?.result?._id || templateId;
      const refreshed = await refreshTemplates();
      // Some create responses omit the ID; resolve it from the refreshed list only if unique.
      const matches = refreshed.filter(
        (item) =>
          item.name === payload.name && Number(item.type) === payload.type,
      );
      const resolvedId =
        savedId || (matches.length === 1 ? matches[0]._id : "");
      if (!resolvedId)
        throw new Error(
          "Template saved, but its ID could not be resolved. Reload before saving settings.",
        );
      setSelectedTemplateId(resolvedId);
      setSettings((prev) => {
        if (selection === "self")
          return { ...prev, self_template_id: resolvedId };
        // if (selection === "shared")
        //   return { ...prev, shared_reviewer_template_id: resolvedId };
        return {
          ...prev,
          role_templates: [
            ...prev.role_templates.filter(
              (item) => (item.position_id || item.role_id) !== positionId,
            ),
            { position_id: positionId, template_id: resolvedId },
          ],
        };
      });
      toast({
        // title: selectedTemplateId
        title: templateId
          ? "Template updated successfully"
          : "Template created successfully",
        // description: "Save Settings to persist the template assignment.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });
    } catch (error) {
      notifyError("Failed to save template", error);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!canSaveSettings) return;

    const payload = {
      schedule_type: Number(settings.schedule_type),
      activation_offset_days: Number(settings.activation_offset_days),
      cap_type: Number(settings.cap_type),
      self_template_id: settings.self_template_id,
      reviewer_template_mode: Number(settings.reviewer_template_mode),
    };

    if (payload.cap_type === 1) {
      payload.company_cap_percent = Number(settings.company_cap_percent);
    } else {
      payload.band_caps = bands.map((band) => ({
        band_id: band._id,
        cap_percent: Number(
          settings.band_caps.find((item) => item.band_id === band._id)
            ?.cap_percent,
        ),
      }));
    }

    // if (payload.reviewer_template_mode === 1) {
    //   payload.shared_reviewer_template_id =
    //     settings.shared_reviewer_template_id;
    // } else {
    //   payload.role_templates = validPositionMappings.map((item) => ({
    //     position_id: item.position_id,
    //     template_id: item.template_id,
    //   }));
    // }
    if (payload.reviewer_template_mode === 2) {
      payload.role_templates = validPositionMappings.map((item) => ({
        position_id: item.position_id,
        template_id: item.template_id,
      }));
    }

    setSaving(true);
    try {
      const response = await api.put("/performance/save_settings", payload);
      const warning =
        response?.data?.planning_error ||
        response?.data?.result?.planning_error;
      toast({
        title: warning
          ? "Settings saved with a planning warning"
          : "Performance settings saved successfully",
        description: warning || undefined,
        status: warning ? "warning" : "success",
        duration: 4000,
        isClosable: true,
      });
      // Reset visible settings fields, preserving saved template assignments
      setSettings((prev) => ({
        ...prev,
        schedule_type: "",
        activation_offset_days: "",
        cap_type: "",
        company_cap_percent: "",
        band_caps: [],
        reviewer_template_mode: "",
      }));

      // Reset Question Templates dropdown
      setSelection("");

      // Clear selected template
      setSelectedTemplateId("");

      // Clear all 10 question inputs
      setTemplateQuestions(blankQuestions());
    } catch (error) {
      notifyError("Failed to save performance settings", error);
    } finally {
      setSaving(false);
    }
  };

  console.log("Performance settings validation:", {
    hasSelfTemplate,
    hasReviewerTemplate,
    hasValidCap,
    canSaveSettings,
    self_template_id: settings.self_template_id,
    reviewer_template_mode: settings.reviewer_template_mode,
    // shared_reviewer_template_id: settings.shared_reviewer_template_id,
    role_templates: settings.role_templates,
    templates,
  });

  console.log("Position template validation:", {
    reviewerMode: settings.reviewer_template_mode,
    selfTemplateId: settings.self_template_id,
    roleTemplates: settings.role_templates,
    jobTitles: jobTitles.map((p) => ({
      id: p._id,
      name: p.position_name,
    })),
    validPositionMappings,
    hasSelfTemplate,
    hasReviewerTemplate,
  });

  return (
    <Box
      w="100%"
      minW={0}
      bg="#F6F7F9"
      py={{ base: 3, md: 5 }}
      fontFamily="Poppins"
    >
      <Stack spacing={4} w="100%">
        <Box
          bg="white"
          border="1px solid #E2E5EA"
          borderRadius="12px"
          p={{ base: 4, md: 6 }}
        >
            <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            >
          <Heading
            fontSize={{ base: "18px", md: "21px" }}
            fontWeight="600"
            mb={5}
            color="#10151E"
          >
            Schedule and increment cap
          </Heading>
          <Text
          fontSize="12px"
          fontWeight="600"
          >Note: Complete Question Templates before setting Schedule and Increment Cap.</Text>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={5} spacingY={4}>
            <FormControl>
              <FormLabel
                fontFamily="Poppins, sans-serif"
                lineHeight={1.2}
                letterSpacing="-0.04em"
                fontWeight={500}
                fontSize="14px"
                color="#000000"
              >
                Appraisal schedule
              </FormLabel>
              <Select
                {...controlStyles}
                value={settings.schedule_type}
                onChange={updateSetting("schedule_type")}
              >
                <option value="" disabled>
                  Select Appraisal Schedule
                </option>
                <option value={1}>Fiscal Year</option>
                <option value={2}>Work Anniversary</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel
                fontFamily="Poppins, sans-serif"
                lineHeight={1.2}
                letterSpacing="-0.04em"
                fontWeight={500}
                fontSize="14px"
                color="#000000"
              >
                Form activation
              </FormLabel>
              <Select
                {...controlStyles}
                value={settings.activation_offset_days}
                onChange={updateSetting("activation_offset_days")}
              >
                <option value="" disabled>
                  Select Form Activation
                </option>
                <option value={-5}>Five days before appraisal</option>
                <option value={0}>On appraisal date</option>
                <option value={-10}>Ten days before appraisal</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel
                fontFamily="Poppins, sans-serif"
                lineHeight={1.2}
                letterSpacing="-0.04em"
                fontWeight={500}
                fontSize="14px"
                color="#000000"
              >
                Cap policy
              </FormLabel>
              <Select
                {...controlStyles}
                value={settings.cap_type}
                onChange={updateSetting("cap_type")}
              >
                <option value="" disabled>
                  Select Cap Policy
                </option>
                <option value={1}>Company-wide</option>
                <option value={2}>By employee band</option>
              </Select>
            </FormControl>
            {settings.cap_type === 1 && (
              <FormControl>
                <FormLabel
                  fontFamily="Poppins, sans-serif"
                  lineHeight={1.2}
                  letterSpacing="-0.04em"
                  fontWeight={500}
                  fontSize="14px"
                  color="#000000"
                >
                  Company-wide cap (%)
                </FormLabel>
                <Input
                  {...controlStyles}
                  type="number"
                  min={0}
                  max={100}
                  value={settings.company_cap_percent}
                  onChange={updateSetting("company_cap_percent")}
                />
              </FormControl>
            )}
          </SimpleGrid>
          {settings.cap_type === 2 && (
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacingX={5}
              spacingY={4}
              mt={4}
            >
              {bands.map((band) => {
                const cap = settings.band_caps.find(
                  (item) => item.band_id === band._id,
                )?.cap_percent;
                return (
                  <FormControl key={band._id} isRequired>
                    <FormLabel
                      fontFamily="Poppins, sans-serif"
                      lineHeight={1.2}
                      letterSpacing="-0.04em"
                      fontWeight={500}
                      fontSize="14px"
                      color="#000000"
                    >
                      {band.band_name} cap (%)
                    </FormLabel>
                    <Input
                      {...controlStyles}
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Enter cap percentage"
                      value={cap ?? ""}
                      onChange={(e) => updateBandCap(band._id, e.target.value)}
                    />
                  </FormControl>
                );
              })}
            </SimpleGrid>
          )}
          <Text fontSize="11px" color="#858C97" mt={3} mb={4}>
            Self-assessment stays open for 30 days from activation. Reopened
            forms stay active for five days.
          </Text>
          <FormControl>
            <FormLabel
              fontFamily="Poppins, sans-serif"
              lineHeight={1.2}
              letterSpacing="-0.04em"
              fontWeight={500}
              fontSize="14px"
              color="#000000"
            >
              Reviewer templates
            </FormLabel>
            <Select
              {...controlStyles}
              value={settings.reviewer_template_mode}
              //   onChange={(e) => {
              //     const mode = Number(e.target.value);

              //     setSettings((prev) => ({
              //       ...prev,
              //       reviewer_template_mode: mode,
              //     }));

              //     setSelection("");
              //     setSelectedTemplateId("");
              //     setTemplateQuestions(blankQuestions());
              //   }}
              onChange={(e) => {
                const mode =
                  e.target.value === "" ? "" : Number(e.target.value);

                setSettings((prev) => ({
                  ...prev,
                  reviewer_template_mode: mode,
                }));
              }}
            >
              <option value="" disabled>
                Select Reviewer Template
              </option>
              <option value={1}>Shared</option>
              <option value={2}>Position-based</option>
            </Select>
          </FormControl>
          <Flex justify="flex-end" mt={5}>
            <Button
              {...navyButton}
              onClick={handleSaveSettings}
              isLoading={saving}
              isDisabled={
                loading || saving || savingTemplate || !canSaveSettings
              }
            >
              Save Settings
            </Button>
          </Flex>
        </Box>
        <Box
          bg="white"
          border="1px solid #E2E5EA"
          borderRadius="12px"
          p={{ base: 4, md: 6 }}
        >
          <Flex
            align={{ base: "stretch", sm: "center" }}
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
            gap={3}
            mb={5}
          >
            <Heading
              fontSize={{ base: "18px", md: "21px" }}
              fontWeight="600"
              color="#10151E"
            >
              Question templates
            </Heading>
            <Flex align="center" gap={3}>
              <Text fontSize="12px" fontWeight="600">
                Template
              </Text>

              {/* <Select
                {...controlStyles}
                w="250px"
                value={selection}
                onChange={chooseTemplate}
              >
                <option value="">Select Template Category</option>

                <option value="self">Self-assessment</option>

                <option value="shared">Shared</option>

                {jobTitles.map((position) => (
                  <option key={position._id} value={`position:${position._id}`}>
                    {position.position_name}
                  </option>
                ))}
              </Select> */}
              <Select
                {...controlStyles}
                w="250px"
                value={selection}
                onChange={chooseTemplate}
              >
                <option value="">Select Template</option>

                <option value="self">Self-assessment</option>

                {jobTitles.map((position) => (
                  <option key={position._id} value={`position:${position._id}`}>
                    {position.position_name}
                  </option>
                ))}
              </Select>
            </Flex>
          </Flex>
          <Stack spacing={4}>
            {questionLabels.map((label, index) => (
              <FormControl key={index} isRequired>
                <FormLabel
                  fontFamily="Poppins, sans-serif"
                  lineHeight={1.2}
                  letterSpacing="-0.04em"
                  fontWeight={500}
                  fontSize="14px"
                  color="#000000"
                  mb={2}
                >
                  Q{index + 1}. {label}
                </FormLabel>
                <Input
                  {...controlStyles}
                  placeholder={`Enter the question based on ${label}`}
                  value={templateQuestions[index]?.text || ""}
                  onChange={(event) =>
                    // handleQuestionChange(index + 1, event.target.value)
                    handleQuestionChange(
                      templateQuestions[index]?.id ?? index + 1,
                      event.target.value,
                    )
                  }
                />
              </FormControl>
            ))}
          </Stack>
          {/* <Flex justify="flex-end" mt={5}>
            <Button
              {...navyButton}
              onClick={handleSaveTemplate}
              isLoading={savingTemplate}
              isDisabled={loading || !selection}
            >
              Save Template
            </Button>
          </Flex> */}
          <Flex justify="flex-end" mt={5}>
            <Button
              {...navyButton}
              onClick={handleSaveTemplate}
              isLoading={savingTemplate}
              isDisabled={loading || savingTemplate || !selection}
            >
              {existingSelectedTemplate ? "Update Template" : "Save Template"}
            </Button>
          </Flex>
        </Box>
      </Stack>
    </Box>
  );
}
