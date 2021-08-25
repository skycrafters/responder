const processEvent = require("./eventProcessor.js");

const createUserEvent = {
	version: "0",
	id: "39de3151-aa52-093d-1e24-8183e773736c",
	"detail-type": "AWS API Call via CloudTrail",
	source: "aws.iam",
	account: "961944027523",
	time: "2021-05-20T23:06:17Z",
	region: "us-east-1",
	resources: [],
	detail: {
		eventVersion: "1.08",
		userIdentity: {
			type: "IAMUser",
			principalId: "AIDA576CVAGB5UIDLMO7G",
			arn: "arn:aws:iam::961944027523:user/xabi",
			accountId: "961944027523",
			accessKeyId: "AKIA576CVAGBRFQMKYZH",
			userName: "xabi"
		},
		eventTime: "2021-05-20T23:06:17Z",
		eventSource: "iam.amazonaws.com",
		eventName: "CreateUser",
		awsRegion: "us-east-1",
		sourceIPAddress: "65.48.184.71",
		userAgent: "aws-cli/1.18.191 Python/2.7.16 Darwin/20.4.0 botocore/1.19.31",
		requestParameters: { userName: "noncompliantuser2" },
		responseElements: { user: [Object] },
		requestID: "adae0414-fbb3-4245-814c-34130d4aa6b4",
		eventID: "ff6a6d76-1e54-4b7c-8ca2-079b1eb35c03",
		readOnly: false,
		eventType: "AwsApiCall",
		managementEvent: true,
		eventCategory: "Management"
	}
};

const signinEvent = {
	version: "0",
	id: "449af688-045a-a864-52e9-86a2e3a927d8",
	"detail-type": "AWS Console Sign In via CloudTrail",
	source: "aws.signin",
	account: "123412341234",
	time: "2021-04-08T15:24:47Z",
	region: "us-east-1",
	resources: [],
	detail: {
		eventVersion: "1.08",
		userIdentity: {
			type: "Root",
			principalId: "123412341234",
			arn: "arn:aws:iam::123412341234:root",
			accountId: "123412341234"
		},
		eventTime: "2021-04-08T15:24:47Z",
		eventSource: "signin.amazonaws.com",
		eventName: "ConsoleLogin",
		awsRegion: "global",
		sourceIPAddress: "72.22.136.78",
		userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
		requestParameters: null,
		responseElements: { ConsoleLogin: "Success" },
		additionalEventData: {
			LoginTo:
        "https://console.aws.amazon.com/lambda/home?region=us-east-1&state=hashArgs%23%2Ffunctions%2Fcloud-responder-dev-hello%3Ftab%3Dcode&isauthcode=true",
			MobileVersion: "No",
			MFAUsed: "Yes"
		},
		eventID: "d59a9950-1001-4818-a5e6-afe306dfefb2",
		readOnly: false,
		eventType: "AwsConsoleSignIn",
		managementEvent: true,
		eventCategory: "Management"
	}
};

const createInstance = {
	version: "0",
	id: "3ca15212-009a-abb0-3241-ff51bcd57461",
	"detail-type": "AWS API Call via CloudTrail",
	source: "aws.ec2",
	account: "123412341234",
	time: "2021-04-15T17:46:48Z",
	region: "us-east-1",
	resources: [],
	detail: {
		eventVersion: "1.08",
		userIdentity: {
			type: "Root",
			principalId: "123412341234",
			arn: "arn:aws:iam::123412341234:root",
			accountId: "123412341234",
			accessKeyId: "ASIA57123412341234",
			sessionContext: {
				sessionIssuer: {},
				webIdFederationData: {},
				attributes: {
					mfaAuthenticated: "true",
					creationDate: "2021-04-15T16:07:18Z"
				}
			}
		},
		eventTime: "2021-04-15T17:46:48Z",
		eventSource: "ec2.amazonaws.com",
		eventName: "RunInstances",
		awsRegion: "us-east-1",
		sourceIPAddress: "99.99.123.123",
		userAgent: "console.ec2.amazonaws.com",
		requestParameters: {
			instancesSet: {
				items: [
					{
						imageId: "ami-0742b4e673072066f",
						minCount: 1,
						maxCount: 1
					}
				]
			},
			instanceType: "t2.micro",
			blockDeviceMapping: {
				items: [
					{
						deviceName: "/dev/xvda",
						ebs: {
							volumeSize: 8,
							deleteOnTermination: true,
							volumeType: "gp2"
						}
					}
				]
			},
			tenancy: "default",
			monitoring: {
				enabled: false
			},
			disableApiTermination: false,
			instanceInitiatedShutdownBehavior: "stop",
			networkInterfaceSet: {
				items: [
					{
						deviceIndex: 0,
						subnetId: "subnet-08986e2b3efd075e8",
						description: "Primary network interface",
						deleteOnTermination: true,
						groupSet: {
							items: [
								{
									groupId: "sg-02222445d94a28e9a"
								}
							]
						},
						ipv6AddressCount: 0
					}
				]
			},
			ebsOptimized: false,
			creditSpecification: {
				cpuCredits: "standard"
			},
			capacityReservationSpecification: {
				capacityReservationPreference: "open"
			},
			hibernationOptions: {
				configured: false
			},
			metadataOptions: {
				httpTokens: "optional",
				httpPutResponseHopLimit: 1,
				httpEndpoint: "enabled"
			}
		},
		responseElements: {
			requestId: "91e16e25-68bc-4e19-a937-a6098cb2abc3",
			reservationId: "r-09e4a53841892a1f5",
			ownerId: "123412341234",
			groupSet: {},
			instancesSet: {
				items: [
					{
						instanceId: "i-0f6abe7b9916c5520",
						imageId: "ami-0742b4e673072066f",
						instanceState: {
							code: 0,
							name: "pending"
						},
						privateDnsName: "ip-10-0-0-223.ec2.internal",
						amiLaunchIndex: 0,
						productCodes: {},
						instanceType: "t2.micro",
						launchTime: 1618508808000,
						placement: {
							availabilityZone: "us-east-1a",
							tenancy: "default"
						},
						monitoring: {
							state: "disabled"
						},
						subnetId: "subnet-08986e2b3efd075e8",
						vpcId: "vpc-0c1a1a1a1a1a1a1a1",
						privateIpAddress: "10.0.0.223",
						stateReason: {
							code: "pending",
							message: "pending"
						},
						architecture: "x86_64",
						rootDeviceType: "ebs",
						rootDeviceName: "/dev/xvda",
						blockDeviceMapping: {},
						virtualizationType: "hvm",
						hypervisor: "xen",
						groupSet: {
							items: [
								{
									groupId: "sg-02222445d94a28e6d",
									groupName: "launch-wizard-5"
								}
							]
						},
						sourceDestCheck: true,
						networkInterfaceSet: {
							items: [
								{
									networkInterfaceId: "eni-0ea64b2b89f6dfa07",
									subnetId: "subnet-08986e2b3efd075e8",
									vpcId: "vpc-0c1a1a1a1a1a1a1a1",
									description: "Primary network interface",
									ownerId: "123412341234",
									status: "in-use",
									macAddress: "02:90:a3:8e:56:f9",
									privateIpAddress: "10.0.0.223",
									sourceDestCheck: true,
									interfaceType: "interface",
									groupSet: {
										items: [
											{
												groupId: "sg-02222445d94a28e6d",
												groupName: "launch-wizard-5"
											}
										]
									},
									attachment: {
										attachmentId: "eni-attach-049c5e6ab5c45e4af",
										deviceIndex: 0,
										networkCardIndex: 0,
										status: "attaching",
										attachTime: 1618508808000,
										deleteOnTermination: true
									},
									privateIpAddressesSet: {
										item: [
											{
												privateIpAddress: "10.0.0.223",
												primary: true
											}
										]
									},
									ipv6AddressesSet: {},
									tagSet: {}
								}
							]
						},
						ebsOptimized: false,
						enaSupport: true,
						cpuOptions: {
							coreCount: 1,
							threadsPerCore: 1
						},
						capacityReservationSpecification: {
							capacityReservationPreference: "open"
						},
						hibernationOptions: {
							configured: false
						},
						enclaveOptions: {
							enabled: false
						},
						metadataOptions: {
							state: "pending",
							httpTokens: "optional",
							httpPutResponseHopLimit: 1,
							httpEndpoint: "enabled"
						}
					}
				]
			}
		},
		requestID: "91e16e25-68bc-4e19-a937-a6098cb2abc3",
		eventID: "67e6c1fb-9c90-44f2-adcd-c9128c22b090",
		readOnly: false,
		eventType: "AwsApiCall",
		managementEvent: true,
		eventCategory: "Management"
	}
};

// processEvent(createUserEvent);
// processEvent(signinEvent);
processEvent(createInstance);
