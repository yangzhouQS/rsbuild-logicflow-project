import { isObject } from 'lodash-es';

export function getModelText(text: string | { value: string }): string {
	return isObject(text) ? text.value : text;
}