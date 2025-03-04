import classNames from 'classnames';
import * as React from 'react';

import {Autocomplete, AutocompleteApi, AutocompleteOption} from 'argo-ui';

interface TagsInputProps {
    tags: string[];
    autocomplete?: (AutocompleteOption | string)[];
    sublistQuery?: (key: string) => Promise<any>;
    onChange?: (tags: string[]) => void;
    placeholder?: string;
}

require('./tags-input.scss');

export class TagsInput extends React.Component<TagsInputProps, {tags: string[]; input: string; focused: boolean; subTags: string[]; subTagsActive: boolean}> {
    private inputElement: HTMLInputElement;
    private autocompleteApi: AutocompleteApi;

    constructor(props: TagsInputProps) {
        super(props);
        this.state = {tags: props.tags || [], input: '', focused: false, subTags: [], subTagsActive: false};
    }

    public render() {
        return (
            <div
                className={classNames('tags-input argo-field', {'tags-input--focused': this.state.focused || !!this.state.input})}
                onClick={() => this.inputElement && this.inputElement.focus()}>
                {this.props.tags ? (
                    this.props.tags.map((tag, i) => (
                        <span className='tags-input__tag' key={tag}>
                            {tag}{' '}
                            <i
                                className='fa fa-times'
                                onClick={e => {
                                    const newTags = [...this.state.tags.slice(0, i), ...this.state.tags.slice(i + 1)];
                                    this.setState({tags: newTags});
                                    this.onTagsChange(newTags);
                                    e.stopPropagation();
                                }}
                            />
                        </span>
                    ))
                ) : (
                    <span />
                )}
                <Autocomplete
                    filterSuggestions={true}
                    autoCompleteRef={api => (this.autocompleteApi = api)}
                    value={this.state.input}
                    items={this.state.subTagsActive ? this.state.subTags : this.props.autocomplete}
                    onChange={e => this.setState({input: e.target.value})}
                    onSelect={value => {
                        if (this.props.sublistQuery != null && !this.state.subTagsActive) {
                            this.setState({subTagsActive: true});
                            this.props.sublistQuery(value).then(list => {
                                this.setState({
                                    subTags: list || []
                                });
                            });
                        } else {
                            if (this.state.tags.indexOf(value) === -1) {
                                const newTags = this.state.tags.concat(value);
                                this.setState({input: '', tags: newTags, subTags: []});
                                this.onTagsChange(newTags);
                            }
                            this.setState({subTagsActive: false});
                        }
                    }}
                    renderInput={props => (
                        <input
                            {...props}
                            placeholder={this.props.placeholder}
                            ref={inputEl => {
                                this.inputElement = inputEl;
                                if (props.ref) {
                                    (props.ref as any)(inputEl);
                                }
                            }}
                            onFocus={e => {
                                if (props.onFocus) {
                                    props.onFocus(e);
                                }
                                this.setState({focused: true});
                            }}
                            onBlur={e => {
                                if (props.onBlur) {
                                    props.onBlur(e);
                                }
                                this.setState({focused: false});
                            }}
                            onKeyDown={e => {
                                if (e.keyCode === 8 && this.state.tags.length > 0 && this.state.input === '') {
                                    const newTags = this.state.tags.slice(0, this.state.tags.length - 1);
                                    this.setState({tags: newTags});
                                    this.onTagsChange(newTags);
                                }
                                if (props.onKeyDown) {
                                    props.onKeyDown(e);
                                }
                            }}
                            onKeyUp={e => {
                                if (e.keyCode === 13 && this.state.input && this.state.tags.indexOf(this.state.input) === -1) {
                                    const newTags = this.state.tags.concat(this.state.input);
                                    this.setState({input: '', tags: newTags});
                                    this.onTagsChange(newTags);
                                }
                                if (props.onKeyUp) {
                                    props.onKeyUp(e);
                                }
                            }}
                        />
                    )}
                />
            </div>
        );
    }

    private onTagsChange(tags: string[]) {
        if (this.props.onChange) {
            this.props.onChange(tags);
            if (this.autocompleteApi) {
                setTimeout(() => this.autocompleteApi.refresh());
            }
        }
    }
}
