import React, { useState } from 'react';
import { Prompt_Part } from '../../types';
import PromptPart from './PromptPart/PromptPart';

const File: React.FC<{ file: Prompt_Part }> = ({ file, ...otherProps }) => (
	<PromptPart promptPart={file} {...(otherProps as any)} />
);
export default File;
