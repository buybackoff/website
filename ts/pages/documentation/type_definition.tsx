import * as _ from 'lodash';
import * as React from 'react';
import {constants} from 'ts/utils/constants';
import {utils} from 'ts/utils/utils';
import {KindString, TypeDocNode, TypeDocTypes} from 'ts/types';
import {Type} from 'ts/pages/documentation/type';
import {Interface} from 'ts/pages/documentation/interface';
import {CustomEnum} from 'ts/pages/documentation/custom_enum';
import {Enum} from 'ts/pages/documentation/enum';
import {MethodSignature} from 'ts/pages/documentation/method_signature';
import {AnchorTitle} from 'ts/pages/documentation/anchor_title';
import {Comment} from 'ts/pages/documentation/comment';
import {typeDocUtils} from 'ts/utils/typedoc_utils';

const KEYWORD_COLOR = '#a81ca6';

interface TypeDefinitionProps {
    type: TypeDocNode;
    shouldAddId?: boolean;
}

interface TypeDefinitionState {
    shouldShowAnchor: boolean;
}

export class TypeDefinition extends React.Component<TypeDefinitionProps, TypeDefinitionState> {
    public static defaultProps: Partial<TypeDefinitionProps> = {
        shouldAddId: true,
    };
    constructor(props: TypeDefinitionProps) {
        super(props);
        this.state = {
            shouldShowAnchor: false,
        };
    }
    public render() {
        const type = this.props.type;
        if (!typeDocUtils.isPublicType(type.name)) {
            return null; // no-op
        }

        let typePrefix: string;
        let codeSnippet: React.ReactNode;
        switch (type.kindString) {
            case KindString.Interface:
                typePrefix = 'Interface';
                codeSnippet = (
                    <Interface
                        type={type}
                    />
                );
                break;

            case KindString.Variable:
                typePrefix = 'Enum';
                codeSnippet = (
                    <CustomEnum
                        type={type}
                    />
                );
                break;

            case KindString.Enumeration:
                typePrefix = 'Enum';
                const enumValues = _.map(type.children, t => {
                    return {
                        name: t.name,
                        defaultValue: t.defaultValue,
                    };
                });
                codeSnippet = (
                    <Enum
                        values={enumValues}
                    />
                );
                break;

            case KindString['Type alias']:
                typePrefix = 'Type Alias';
                codeSnippet = (
                    <span>
                        <span style={{color: KEYWORD_COLOR}}>type</span> {type.name} ={' '}
                        {type.type.type !== TypeDocTypes.reflection ?
                            <Type type={type.type} /> :
                            <MethodSignature
                                signature={type.type.declaration.signatures[0]}
                                shouldHideMethodName={true}
                                shouldUseArrowSyntax={true}
                            />
                        }
                    </span>
                );
                break;

            default:
                throw utils.spawnSwitchErr('type.kindString', type.kindString);
        }

        const typeDefinitionAnchorId = type.name;
        return (
            <div
                id={this.props.shouldAddId ? typeDefinitionAnchorId : ''}
                className="pb2"
                style={{overflow: 'hidden', width: '100%'}}
                onMouseOver={this.setAnchorVisibility.bind(this, true)}
                onMouseOut={this.setAnchorVisibility.bind(this, false)}
            >
                <AnchorTitle
                    headerType="h3"
                    title={`${typePrefix} ${type.name}`}
                    id={this.props.shouldAddId ? typeDefinitionAnchorId : ''}
                    shouldShowAnchor={this.state.shouldShowAnchor}
                />
                <div style={{fontSize: 16}}>
                    <pre>
                        <code className="hljs">
                            {codeSnippet}
                        </code>
                    </pre>
                </div>
                {type.comment &&
                    <Comment
                        comment={type.comment.shortText}
                        className="py2"
                    />
                }
            </div>
        );
    }
    private setAnchorVisibility(shouldShowAnchor: boolean) {
        this.setState({
            shouldShowAnchor,
        });
    }
}
