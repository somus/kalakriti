export default {
	extends: ['stylelint-config-standard'],
	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					'tailwind',
					'layer',
					'plugin',
					'theme',
					'apply',
					'custom-variant'
				]
			}
		],
		'at-rule-no-deprecated': [
			true,
			{
				ignoreAtRules: ['apply']
			}
		]
	}
};
