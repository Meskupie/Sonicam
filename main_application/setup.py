from setuptools import setup

with open("README", 'r') as f:
    long_description = f.read()

setup(
    name='sonicam',
    version='0.1',
    description='Sonicam Code',
    license="MIT",
    long_description=long_description,
    author='Michael Skupien',
    author_email='meskupie@gmail.com',
    url="http://www.sonicam.ca/",
    packages=['sonicam'],  #same as name
    #install_requires=['bar', 'greek'], #external packages as dependencies
    #scripts=[
    #        'scripts/cool',
    #        'scripts/skype',
    #        ]
)