#!/bin/sh

USAGE="Usage: licGen.sh flexPrivate.pem flexMACID featurePackName licOutFile optionsFile"

if [ $# == 0 ] ; then
	echo $USAGE
	echo "	Generate license given: our private key, the Ethernet MAC of the applicable Flex,"
	echo "	and a feature pack specific file."
	echo
	echo "	flexMACID should look like '001F488099CC'.  THIS MUST BE CAPITALIZED"
	echo
	echo "	'licOutFile' is filename of generated license file"
	exit 1;
fi

privKey=$1
mac=$2
featurePackName=$3
licOut=$4
optionsFile=$5

if [ -z "$privKey" ]; then
	>&2 echo "You must specify file that contains our private key"
	exit 1
fi

if [ -z "$mac" ]; then
	>&2 echo "You must specify file that contains our private key"
	exit 1
fi

>&2 echo "Private key file: $privKey"
>&2 echo "License generated for STARflex: $mac"
>&2 echo "Feature pack name: $featurePackName"
if [ -z "$optionsFile" ]; then
	>&2 echo "NO OPTIONS FILE SPECIFIED.  This is okay, but just so you know"
else
	>&2 echo "License option file is: $optionsFile"
fi

tempdir=$(mktemp -d)

# Generate encrypted checksum of license.  Keep in binary form.
licPayload='["'$mac'","'$featurePackName'"]'
printf "$licPayload" | openssl rsautl -sign -inkey $privKey -out $tempdir/licPayload.enc

# Generate encrypted options file.  Asymmetric encrypt directly using our private key so file length
# limited to less than 256 bytes
echo "$licPayload" | cat - $optionsFile > $tempdir/optionsFile
if [ -f "$optionsFile" ] ; then
	if [ $(wc -c < $optionsFile) -gt 256 ] ; then
		echo "Options file $optionsFile too big"
		exit 1
	fi
fi
cat $tempdir/optionsFile | openssl rsautl -sign -inkey $privKey -out $tempdir/optionsFile.enc

# Concatenate the license payload with license options
cat $tempdir/licPayload.enc $tempdir/optionsFile.enc | openssl enc -base64 > $licOut

#echo "License file output to $licOut"
value=`cat $licOut`
echo "$value"

rm -rf $tempdir
rm -rf $licOut

#echo -n $mac | cat - $optionsFile | openssl dgst -sha1 -binary | openssl rsautl -sign -inkey $privKey | \
#openssl enc -base64 > $licOut

#echo -n $mac | cat - $optionsFile | openssl dgst -sha1 -binary | openssl enc -base64 > $sumOut
