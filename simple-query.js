////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var collection = function ( array, opts ) {
		var store = [],
			typeOf,
			deepTest,
			logicalOps,
			comparisonOps,
			evaluate,
			test,
			queryStore;
		// Initially, this should just have single-depth document matching
		
		typeOf = function ( value ) {
			var s = typeof value;
			if ( s === 'object' ) {
				if (value) {
					if ( typeof value.length === 'number' &&
							!( value.propertyIsEnumerable( 'length' ) ) &&
							typeof value.splice === 'function' ) {
						s = 'array';
					}
				} else {
					s = 'null';
				}
			}
			return s;
		};
		
		deepTest = function ( object, path, evaluation ) {
			var pathArray,
				firstKey,
				recurser,
				result = false;
			
			if ( typeof object === "object" ) {
				if ( object instanceof Array ) {
					return object.some(
						function ( element ) {
							return deepTest( element, path );
						}
					);
				}
				else {
					if ( typeOf( path ) === "array" ) {
						pathArray = path;
					}
					else {
						pathArray = path.split( "." );
					}
					
					firstKey = pathArray.shift();
					
					if ( object[ firstKey ] !== undefined ) {
						if ( pathArray.length === 0 ) {
							return evaluation( object[ firstKey ] );
						}
						else {
							return deepTest( object[ firstKey ], pathArray );
						}
					}
				}
			}
			
			return result;
		},

		
		
		logicalOps = {
			$and: function ( expression, document ) {
				var result = false;
				
				// expression should be an array
				if ( typeOf( expression ) === "array" ) {
					result = expression.every(
						function ( element ) {
							return evaluate( element, document );
						}
					);
				}
				else if ( typeOf( expression ) === "object" ) {
					return evaluate( element, document );
				}
				
				return result;
			},
			$or: function ( expression, document ) {
				var result = false;
				
				// expression should be an array
				if ( typeOf( expression ) === "array" ) {
					result = expression.some(
						function ( element ) {
							return evaluate( element, document );
						}
					);
				}
				else if ( typeOf( expression ) === "object" ) {
					return evaluate( element, document );
				}
				
				return result;
			},
			$not: function ( expression, document ) {
				return !evaluate( element, document );
			},
			$nor: function ( expression, document ) {
				var result = false;
				
				// expression should be an array
				if ( typeOf( expression ) === "array" ) {
					result = expression.some(
						function ( element ) {
							return evaluate( element, document );
						}
					);
				}
				else if ( typeOf( expression ) === "object" ) {
					return evaluate( element, document );
				}
				
				return !result;
			},
			$where: function ( expression, document ) {
				if ( typeOf( expression ) === "function" ) {
					return expression.call( document, document );
				}
				
				return false;
			}
		};
		
		comparisonOps = {
			$eq: function ( documentValue, testValue ) {
				return documentValue == testValue;
			},
			$gt: function ( documentValue, testValue ) {
				return documentValue > testValue;
			},
			$gte: function ( documentValue, testValue ) {
				return documentValue >= testValue;
			},
			$lt: function ( documentValue, testValue ) {
				return documentValue < testValue;
			},
			$lte: function ( documentValue, testValue ) {
				return documentValue <= testValue;
			},
			$ne: function ( documentValue, testValue ) {
				return documentValue != testValue;
			},
			$in: function ( documentValue, testValue ) {
				if ( typeOf( testValue ) === "array" ) {
					return ( testValue.indexOf( documentValue ) !== -1 );
				}
				
				return false;
			},
			$nin: function ( documentValue, testValue ) {
				if ( typeOf( testValue ) === "array" ) {
					return ( testValue.indexOf( documentValue ) === -1 );
				}
				
				return false;
			},
			$exists: function ( documentValue, testValue ) {
				if ( typeOf( testValue ) === "boolean" ) {
					if ( documentValue !== undefined ) {
						return testValue;
					}
					else {
						return !testValue;
					}
				}
				else {
					return false;
				}
			},
			$regex: function ( documentValue, testValue, options ) {
				
			}
		};
			
		// evaluate( expression )
		// evaluate an expression, returns true or false
		evaluate = function ( expression, document ) {
			var result = false,
				expressionKeys;
			
			expressionKeys = Object.keys( expression );
			
			result = expressionKeys.every(
				function ( element, i ) {					
					if ( logicalOps[ element ] ) {
						return logicalOps[ element ]( expression[ element ], document );
					}
					else if ( comparisonOps[ element ] ) {
						return comparisonOps[ element ]( document, expression[ element ] );
					}
					else {
						return deepTest(
							document,
							element,
							function ( documentValue ) {
								if ( typeOf( expression[ element ] ) === "object" ) {
									return evaluate( expression[ element ], documentValue );
								}
								else if ( typeOf( expression[ element ] ) === "array" ) {
									return evaluate( expression[ element ], documentValue );
								}
								else {
									return expression[ element ] == documentValue;
								}
							}
						);
					}
				}
			);
			
			return result;
		};
		
		test = function ( path, operator, value ) {
			
		}
		
		// deepMatch()
		// find a matching node and run evaluate
					
		// operators
		// logical: $and, $or, $not, $where
		// operator comes first
		// comparison: $lt, $lte, $gt, $gte, $in, $nin, $ne, $exists, $regex
		// path comes first
		
		// filter array
		// result = array.filter( callback )
		
		queryStore = function ( store, query, limit, page ) {
			var result;
			
			page = page || 1;
			limit = limit || 0;
			
			if ( Object.keys( query ).length ) {
				result = store.filter(
					function ( element, i ) {
						return evaluate( query, element );
					}
				);
			}
			else {
				result = store;
			}
			
			if ( limit || page ) {
				
			}
			
			return result;
		}
		
		
		return {
			data: array,
			find: function ( query, opts, callback ) {
				try {
					callback( null, queryStore( this.data, query, opts.limit ) );
				}
				catch ( error ) {
					callback( error, null );
				}
			
				return this;
			},
			findOne: function ( query, opts, callback ) {
				var result;
				
				try {
					result = queryStore( this.data, query, 1 );
					
					callback( null, ( result.length ? result[ 0 ] : null ) );
				}
				catch ( error ) {
					callback( error, null );
				}
			
				return this;
			},
			count: function ( query, opts, callback ) {
				
			},
			insert: function ( data, opts, callback ) {
				
			}
		}
	};
	
////////////////////////////////////////////////////////////////////////////////
