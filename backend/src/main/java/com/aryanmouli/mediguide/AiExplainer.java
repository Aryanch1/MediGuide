package com.aryanmouli.mediguide;

/** Explains a medicine label; the live implementation is GeminiClient. */
public interface AiExplainer {
  ExplainDtos.Explanation explain(String labelText) throws Exception;
}
