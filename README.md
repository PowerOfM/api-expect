# APIExpect
A simple input validation system designed for apis or form inputs. Supports custom validators and actually readable outputs.

## Contents
- [Installation](#installation)
- [Usage](#usage)
- [Templates](#templates)
  + [Short-Hand](#short-hand)
  + [Array Short-Hand](#array-short-hand)
  + [Long-Form](#long-form)
- [Optional Fields](#optional-fields)
  + [Long-Form](#long-form)
  + [How They Work](#how-they-work)
  + [Required By Default](#required-by-default)
  + [When Optional By Default](#when-optional-by-default)
- [Validators](#validators)

## Installation <a name="installation"></a>
Use Yarn to add APIExpect to your project:
`yarn add api-expect`

## Usage <a name="usage"></a>
APIExpect exports a singleton by default. Import the module and start creating templates!
```js
const expect = require('api-expect')

const template = expect.compile({ myField: 'string:3:50' })

var data = { myField: 'someStuff', _otherMetaField: 42 }
var result = expect.exec(template, data)

// result.error = false
// result.output = { myField: 'someStuff' }
```

## Templates <a name="templates"></a>
APIExpect was designed to limit tedium and make it easy to create validation templates on the fly. It supports 3 main style of templates: short-hand, array short-hand, and long-form. As you may have guessed, both short-hand forms are just convinence functions that expand to the long-form internally. The short-hand forms can only pass static arguments (such as minimum/max string length) to the validators, so in circumstances where you must pass a variable or externally-defined constant, the long form is required. Below is a brief overview of the three forms.

### Short-Hand <a name="short-hand"></a>
This is the most common form and is very handy for simple validation. The basic format is:
```js
{
  field: 'validator:arg1:arg2:arg3:...'
}
```
See the _Validators_ section for more information on the arguments.

Example:
```js
{
  name: 'string:5'
}
```
In words, this template translates to: "The `name` field must be a string of at least 5 characters".

### Array Short-Hand <a name="array-short-hand"></a>
Similar to the short-hand form, this form combines the Array validator with any other validator for the values of the array. The format is:
```js
{
  field: ['validator:arg1:arg2:...', minLength, maxLength]
}
```
The `minLength` is optional and defaults to 0; `maxLength` is also optional and defaults to infinity. See the _Validators_ section for more information on the arguments.

Example:
```js
{
  favouriteColours: ['string:3:20', 0, 5]
}
```
This template translates to: "The `favouriteColours` field must be an array of strings whose lengths are between 3 and 20 characters; the array must have between 0 and 5 elements".

### Long Form <a name="long-form"></a>
And when the convient methods fail to deliver, we resort to verbose measures. The long format is:
```js
{
  field: { 'validator': [arg1, arg2, arg3, ...] }
}
```
See the _Validators_ section for more information on the arguments.

Example:
```js
const STATUSES = [ 'Active', 'Inactive', 'Disabled' ]
{
  status: { 'index': [STATUSES] }
}
```
This template translates to: "The `status` field must be a number who value is greater than or equal to 0, and less the length of the array STATUSES (in this case 3)".


## Optional Fields <a name="optional-fields"></a>
### How They Work <a name="how-they-work"></a>
When a required field is invalid, the whole input is rejected and error messages are returned. When an optional field is invalid, its value is ignored. Most validators have a 'default' field which will be returned in the final output when the optional field is either empty or invalid.

### Required By Default <a name="required-by-default"></a>
By default, all fields are required. You can change by setting the value `defaultOptional`.
Example:
```js
const expect = require('api-expect')

// Make all fields optional by default
expect.defaultOptional = true

// Make all fields required by default
expect.defaultOptional = false
```
**NOTE: If you change `defaultOptional` to be true, the short-hand behaviour changes!** (See _When Optional By Default_)

To make a specific field optional, insert the '~' field in a short-hand validator, or a boolean value for `required` as the first parameter for the array in an array-short-hand or long-form entry.
Example:
```js
const STATUSES = [ 'Active', 'Inactive', 'Disabled' ]

{
  status: { 'index', [false, STATUSES] },
  colour: '~string:3:50:black'
}
Translation: "The `status` field should be a number >= 0 and < `STATUSES.length` but default to 0; and `colour` should be a string whose length is between 3 and 50, but default to 'black'".


### When Optional By Default <a name="when-optional-by-default"></a>
When `defaultOptional` is `true`, all fields are optional by default. To make a specific field required, preappend an `*` (asterisk), as such:
```js
{
  name: '*string:3',
  colour: 'string:3:50:black'
}
```
Translation: "The `name` field must be a string of at least 3 characters; and the `colour` field should be a string whose length is between 3 and 50, but default to 'black'".


## Validators <a name="validators"></a>
There are a wealth of default validators that exist. All validators' first argument is `required` (omitted for breivity).

| Validator Name    | Arg1 | Arg2 | Arg 3
|-------------------|------|------|------
| object            | Uncompiled Template
| array             | Validator | minLength | maxLength
| string            | minLength | maxLength | default
| html              | minLength | maxLength | default
| email             | default
| url               | default
| bool              | default
| number            | min | max | default
| index             | array | min | default
| date              | min | max | default